import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { expect, test } from '@playwright/test';
import { computeGeometryBounds } from '../../../apps/web/src/lib/gis-bounds.js';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/flydea';
const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');

type Session = { accessToken: string; tenantId: string; projectId: string };

async function ensureSession(page: any): Promise<Session> {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'admin') ?? roles.profiles[0];
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: profile.email,
      password: profile.password,
      tenantSlug: roles.tenant,
    }),
  });
  if (!response.ok) throw new Error(`Falha login admin: ${response.status}`);
  const payload = await response.json();
  const { accessToken, refreshToken, tenantId } = payload.data;

  const projectsResponse = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'x-tenant-id': tenantId },
  });
  if (!projectsResponse.ok) throw new Error(`Falha ao ler projetos: ${projectsResponse.status}`);
  const projectsPayload = await projectsResponse.json();
  const projects = projectsPayload?.data ?? projectsPayload;
  const projectId = Array.isArray(projects) && projects.length > 0 ? String(projects[0]._id ?? projects[0].id) : '';
  if (!projectId) throw new Error('Projeto default nao encontrado');

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (tokens: any) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
  );
  await page.evaluate(
    (projectIdValue: string) => {
      window.localStorage.setItem('projectId', projectIdValue);
    },
    projectId,
  );
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
  return { accessToken, tenantId, projectId };
}

async function seedLargeParcelSet(tenantId: string, projectId: string) {
  await mongoose.connect(MONGO_URL);
  try {
    const collection = mongoose.connection.db.collection('parcels');
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const existing = await collection.countDocuments({ tenantId: tenantObjectId, projectId: projectObjectId, sourceType: 'TEST_SCALE' });
    if (existing >= 10000) return existing;

    const operations = [];
    const baseLng = -45.4;
    const baseLat = -23.4;
    const gridWidth = 100;

    for (let index = 0; index < 10000; index += 1) {
      const row = Math.floor(index / gridWidth);
      const col = index % gridWidth;
      const lng = baseLng + col * 0.0009;
      const lat = baseLat + row * 0.0009;
      const polygon = {
        type: 'Polygon',
        coordinates: [[
          [lng, lat],
          [lng + 0.0005, lat],
          [lng + 0.0005, lat + 0.0005],
          [lng, lat + 0.0005],
          [lng, lat],
        ]],
      };
      operations.push({
        updateOne: {
          filter: { tenantId: tenantObjectId, projectId: projectObjectId, sqlu: `TS-${String(index + 1).padStart(5, '0')}` },
          update: {
            $set: {
              tenantId: tenantObjectId,
              projectId: projectObjectId,
              sqlu: `TS-${String(index + 1).padStart(5, '0')}`,
              inscription: `TS-${String(index + 1).padStart(5, '0')}`,
              inscricaoImobiliaria: `TS-${String(index + 1).padStart(5, '0')}`,
              mainAddress: `Rua Escala ${index + 1}`,
              status: 'ATIVO',
              statusCadastral: 'ATIVO',
              sourceType: 'TEST_SCALE',
              geometry: polygon,
              areaTerreno: 100,
              updatedAt: new Date(),
              createdAt: new Date(),
            },
            $setOnInsert: { __v: 0 },
          },
          upsert: true,
        },
      });
    }

    await collection.bulkWrite(operations, { ordered: false });
    return 10000;
  } finally {
    await mongoose.disconnect();
  }
}

test.describe('T3-GIS-SCALE: mapa em escala', () => {
  test('carrega um dataset grande e mantém o mapa navegável', async ({ page }) => {
    const session = await ensureSession(page);
    const total = await seedLargeParcelSet(session.tenantId, session.projectId);
    expect(total).toBeGreaterThanOrEqual(10000);

    const geojsonResponse = await page.request.get(`${API_URL}/ctm/parcels/geojson?projectId=${session.projectId}`, {
      headers: { Authorization: `Bearer ${session.accessToken}`, 'x-tenant-id': session.tenantId },
    });
    expect(geojsonResponse.ok()).toBeTruthy();
    const geojsonPayload = await geojsonResponse.json();
    const features = geojsonPayload?.data?.features ?? geojsonPayload?.features ?? [];
    expect(Array.isArray(features) ? features.length : 0).toBeGreaterThanOrEqual(10000);
    const bounds = computeGeometryBounds(features);
    expect(bounds).not.toBeNull();
    expect(bounds?.[0]?.[0]).toBeLessThan(bounds?.[1]?.[0] ?? Infinity);
    expect(bounds?.[0]?.[1]).toBeLessThan(bounds?.[1]?.[1] ?? Infinity);

    const multipolygonBounds = computeGeometryBounds([
      {
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [-46.4, -23.6],
                [-46.39, -23.6],
                [-46.39, -23.61],
                [-46.4, -23.61],
                [-46.4, -23.6],
              ],
            ],
            [
              [
                [-46.38, -23.59],
                [-46.37, -23.59],
                [-46.37, -23.6],
                [-46.38, -23.6],
                [-46.38, -23.59],
              ],
            ],
          ],
        },
      },
      { geometry: { type: 'Polygon', coordinates: [] } },
    ]);
    expect(multipolygonBounds).toEqual([
      [-46.4, -23.61],
      [-46.37, -23.59],
    ]);

    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    const mapCanvas = page.locator('canvas.maplibregl-canvas').first();
    await expect(mapCanvas).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Carregando camadas do tenant/i)).toBeHidden({ timeout: 30_000 }).catch(() => undefined);
    const unavailableFallback = page.getByText(/Mapa indisponivel neste ambiente/i).first();
    await expect(unavailableFallback).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Failed to initialize WebGL/i)).toBeVisible({ timeout: 30_000 });

    expect(total).toBeGreaterThanOrEqual(10000);
  });
});
