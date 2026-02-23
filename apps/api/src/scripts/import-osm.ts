import mongoose from 'mongoose';
import { readFile, writeFile } from 'fs/promises';

type OverpassElement = {
  type: string;
  id: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const DEFAULT_BBOX = '-50.558,-20.294,-50.518,-20.248';
const DEFAULT_OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];
const REQUEST_TIMEOUT_MS = 70_000;
const RETRY_DELAYS_MS = [2000, 5000, 10000, 20000, 30000];
const MAX_ATTEMPTS_PER_ENDPOINT = 5;

const parseBbox = (bbox: string): [number, number, number, number] => {
  const parts = bbox.split(',').map((value) => Number(value.trim()));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    throw new Error(`OSM_BBOX invalido: ${bbox}`);
  }
  const [minA, minB, maxA, maxB] = parts;
  const order = (process.env.OSM_BBOX_ORDER ?? 'lonlat').toLowerCase();
  if (order === 'latlon') {
    return [minA, minB, maxA, maxB];
  }
  return [minB, minA, maxB, maxA];
};

const buildQuery = (bbox: string, type: 'roads' | 'buildings') => {
  const [minLat, minLon, maxLat, maxLon] = parseBbox(bbox);
  return `
[out:json][timeout:60];
(
  way["${type === 'roads' ? 'highway' : 'building'}"](${minLat},${minLon},${maxLat},${maxLon});
);
out body geom;
`;
};

const toCoordinates = (geometry?: Array<{ lat: number; lon: number }>) =>
  geometry ? geometry.map((point) => [point.lon, point.lat]) : [];

const normalizeRing = (coordinates: number[][]) => {
  if (coordinates.length < 3) return null;
  const [first] = coordinates;
  const last = coordinates[coordinates.length - 1];
  if (!last || last[0] !== first[0] || last[1] !== first[1]) {
    return [...coordinates, first];
  }
  return coordinates;
};

const isOverpassBusy = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('too busy') ||
    normalized.includes('timeout') ||
    normalized.includes('dispatcher_client')
  );
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getOverpassUrls = () => {
  const raw = process.env.OSM_OVERPASS_URLS;
  if (!raw) {
    return DEFAULT_OVERPASS_URLS;
  }
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

type OverpassFetchResult = {
  data: OverpassResponse;
  payloadBytes: number;
  status: number;
  endpoint: string;
};

class OverpassFetchError extends Error {
  readonly busy: boolean;
  readonly status?: number;
  readonly endpoint: string;
  readonly payloadBytes?: number;

  constructor(
    message: string,
    options: { busy: boolean; status?: number; endpoint: string; payloadBytes?: number },
  ) {
    super(message);
    this.busy = options.busy;
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.payloadBytes = options.payloadBytes;
  }
}

async function fetchOverpass(query: string, endpoint: string): Promise<OverpassFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    const raw = await res.text();
    const payloadBytes = Buffer.byteLength(raw);
    const busy = isOverpassBusy(raw);
    if (!res.ok || busy) {
      throw new OverpassFetchError(`Overpass error: ${res.status} ${res.statusText}`, {
        busy,
        status: res.status,
        endpoint,
        payloadBytes,
      });
    }
    const data = JSON.parse(raw) as OverpassResponse;
    return { data, payloadBytes, status: res.status, endpoint };
  } catch (error) {
    if (error instanceof OverpassFetchError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new OverpassFetchError(message, { busy: isOverpassBusy(message), endpoint });
  } finally {
    clearTimeout(timeout);
  }
}

async function loadOverpassData(type: 'roads' | 'buildings') {
  const inputPath =
    type === 'roads'
      ? process.env.OSM_INPUT_PATH_ROADS ?? process.env.OSM_INPUT_PATH
      : process.env.OSM_INPUT_PATH_BUILDINGS ?? process.env.OSM_INPUT_PATH;
  if (inputPath) {
    const raw = await readFile(inputPath, 'utf-8');
    return JSON.parse(raw) as OverpassResponse;
  }

  const bbox = process.env.OSM_BBOX ?? DEFAULT_BBOX;
  const [minLat, minLon, maxLat, maxLon] = parseBbox(bbox);
  const query = buildQuery(bbox, type);
  // eslint-disable-next-line no-console
  console.log(
    `[OSM] ${type} bbox(lat,lon)=${minLat},${minLon},${maxLat},${maxLon} order=${
      (process.env.OSM_BBOX_ORDER ?? 'lonlat').toLowerCase()
    }`,
  );
  const endpoints = getOverpassUrls();
  const attempts = new Map<string, number>(endpoints.map((url) => [url, 0]));
  let currentIndex = 0;

  while (attempts.size > 0) {
    const endpoint = endpoints[currentIndex % endpoints.length];
    const endpointAttempts = attempts.get(endpoint);
    if (endpointAttempts === undefined) {
      currentIndex += 1;
      continue;
    }
    if (endpointAttempts >= MAX_ATTEMPTS_PER_ENDPOINT) {
      attempts.delete(endpoint);
      currentIndex += 1;
      continue;
    }
    attempts.set(endpoint, endpointAttempts + 1);
    const delay = RETRY_DELAYS_MS[Math.min(endpointAttempts, RETRY_DELAYS_MS.length - 1)];
    try {
      const result = await fetchOverpass(query, endpoint);
      const elementsCount = result.data.elements?.length ?? 0;
      // eslint-disable-next-line no-console
      console.log(
        `[OSM] ${type} endpoint=${result.endpoint} status=${result.status} bytes=${result.payloadBytes} elements=${elementsCount}`,
      );
      const outputPath = process.env.OSM_OUTPUT_PATH;
      if (outputPath) {
        const suffix = type === 'roads' ? 'roads' : 'buildings';
        const target = outputPath.replace(/\.json$/i, `-${suffix}.json`);
        await writeFile(target, JSON.stringify(result.data));
      }
      return result.data;
    } catch (error) {
      const err = error as OverpassFetchError;
      // eslint-disable-next-line no-console
      console.warn(
        `[OSM] ${type} tentativa=${endpointAttempts + 1} endpoint=${err.endpoint} status=${
          err.status ?? 'n/a'
        } bytes=${err.payloadBytes ?? 'n/a'} busy=${err.busy}`,
      );
      if (err.busy) {
        currentIndex += 1;
      }
      await sleep(delay);
      if (!err.busy) {
        continue;
      }
    }
  }

  throw new Error(`[OSM] Falha ao baixar ${type} de todos endpoints`);
}

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL obrigatoria');
  }

  const tenantSlug = process.env.OSM_TENANT_SLUG ?? 'demo';
  const projectSlug = process.env.OSM_PROJECT_SLUG ?? 'demo';

  const roadsData = await loadOverpassData('roads');
  const buildingsData = await loadOverpassData('buildings');
  const roadElements = roadsData.elements ?? [];
  const buildingElements = buildingsData.elements ?? [];

  const roadDocs: Array<Record<string, unknown>> = [];
  const buildingDocs: Array<Record<string, unknown>> = [];

  for (const element of roadElements) {
    if (element.type !== 'way' || !element.geometry) continue;
    const coords = toCoordinates(element.geometry);
    if (coords.length < 2) continue;
    const tags = element.tags ?? {};
    if (!tags.highway) continue;
    roadDocs.push({
      osmId: element.id,
      name: tags.name ?? undefined,
      nome: tags.name ?? undefined,
      highway: tags.highway,
      tipo: tags.highway,
      geometry: { type: 'LineString', coordinates: coords },
    });
  }

  for (const element of buildingElements) {
    if (element.type !== 'way' || !element.geometry) continue;
    const coords = toCoordinates(element.geometry);
    if (coords.length < 2) continue;
    const tags = element.tags ?? {};
    if (!tags.building) continue;
    const ring = normalizeRing(coords);
    if (!ring) continue;
    buildingDocs.push({
      osmId: element.id,
      name: tags.name ?? undefined,
      nome: tags.name ?? undefined,
      building: tags.building,
      tipo: tags.building,
      geometry: { type: 'Polygon', coordinates: [ring] },
    });
  }

  await mongoose.connect(mongoUrl);
  const connection = mongoose.connection;
  const tenants = connection.collection('tenants');
  const projects = connection.collection('projects');
  const roads = connection.collection('roads');
  const buildings = connection.collection('buildings');

  const tenant = await tenants.findOne({ slug: tenantSlug });
  if (!tenant) {
    throw new Error(`Tenant nao encontrado: ${tenantSlug}`);
  }
  const project =
    (await projects.findOne({ tenantId: tenant._id, slug: projectSlug })) ??
    (await projects.findOne({ tenantId: tenant._id, isDefault: true }));
  if (!project) {
    throw new Error(`Projeto nao encontrado para tenant ${tenantSlug}`);
  }

  const now = new Date();
  const tenantId = tenant._id;
  const projectId = project._id;
  const enrich = (doc: Record<string, unknown>) => ({
    ...doc,
    tenantId,
    projectId,
    updatedAt: now,
  });

  if (roadDocs.length) {
    await roads.bulkWrite(
      roadDocs.map((doc) => ({
        updateOne: {
          filter: { tenantId, projectId, osmId: doc.osmId },
          update: {
            $set: enrich(doc),
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  if (buildingDocs.length) {
    await buildings.bulkWrite(
      buildingDocs.map((doc) => ({
        updateOne: {
          filter: { tenantId, projectId, osmId: doc.osmId },
          update: {
            $set: enrich(doc),
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log(`Importado OSM: ${roadDocs.length} vias, ${buildingDocs.length} edificacoes`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
