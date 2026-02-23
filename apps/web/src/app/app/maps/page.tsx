"use client";

import maplibregl, {
  LngLatBoundsLike,
  LngLatLike,
  Map as MapLibreMap,
  type FilterSpecification,
} from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { area as turfArea } from "@turf/area";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  PencilRuler,
  Building2,
  MousePointer2,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { appLogger } from "@/lib/logger";
import {
  buildMapFeaturesGeojsonUrl,
  createMapFeature,
  deleteMapFeature,
  fetchMapFeaturesGeojson,
  updateMapFeature,
  type MapFeatureType,
} from "@/lib/map-features";
import type { FeatureCollection as GeoFeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { toast } from "sonner";

type LayerStyle = {
  fillColor?: string;
  lineColor?: string;
  lineWidth?: number;
  labelField?: string;
};

type LayerConfig = {
  id: string;
  name: string;
  group: string;
  type: "raster" | "vector" | "basemap";
  source: "geoserver" | "api" | "external";
  tileUrl?: string;
  dataUrl?: string;
  legendUrl?: string;
  opacity: number;
  visible: boolean;
  order: number;
  minZoom?: number;
  maxZoom?: number;
  geometryType?: "polygon" | "line" | "point";
  style?: LayerStyle;
};

type FeatureCollection = GeoFeatureCollection<Geometry, GeoJsonProperties>;

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

type ParcelSummary = {
  parcel: {
    id: string;
    sqlu: string;
    inscription?: string;
    inscricaoImobiliaria?: string;
    mainAddress?: string;
    enderecoPrincipal?: {
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cep?: string;
      cidade?: string;
      uf?: string;
    };
    areaTerreno?: number;
    area?: number;
    statusCadastral?: string;
    status?: string;
    zoneId?: string;
    faceId?: string;
  };
  building?: {
    useType?: string;
    constructionStandard?: string;
    builtArea?: number;
    floors?: number;
    constructionYear?: number;
    occupancyType?: string;
    uso?: string;
    padraoConstrutivo?: string;
    areaConstruida?: number;
    pavimentos?: number;
    anoConstrucao?: number;
    tipoOcupacao?: string;
  } | null;
  socioeconomic?: {
    incomeBracket?: string;
    residents?: number;
    vulnerabilityIndicator?: string;
    faixaRenda?: string;
    moradores?: number;
    vulnerabilidade?: string;
  } | null;
  infrastructure?: {
    water?: boolean;
    sewage?: boolean;
    electricity?: boolean;
    pavingType?: string;
    publicLighting?: boolean;
    garbageCollection?: boolean;
    agua?: boolean;
    esgoto?: boolean;
    energia?: boolean;
    pavimentacao?: string;
    iluminacao?: boolean;
    coleta?: boolean;
  } | null;
  logradouro?: {
    name?: string;
    type?: string;
    code?: string;
    nome?: string;
    tipo?: string;
    codigo?: string;
  } | null;
};

type ParcelValuation = {
  totalValue: number;
  landValue: number;
  constructionValue: number;
};

type ZoneOption = {
  _id: string;
  code?: string;
  name?: string;
  nome?: string;
};

type ProjectDefaults = {
  _id: string;
  isDefault?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  defaultBbox?: [number, number, number, number];
};

type MapDefaults = {
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
};

const JALES_BBOX: [number, number, number, number] = [-50.605, -20.34, -50.47, -20.2];
const DEFAULT_CENTER: [number, number] = [-50.5375, -20.27];
const DEFAULT_ZOOM = 14;
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [JALES_BBOX[0], JALES_BBOX[1]],
  [JALES_BBOX[2], JALES_BBOX[3]],
];

const MAP_FEATURE_LAYER_PREFIX = "local-map-feature";
const MAP_FEATURE_PARCELS_URL = buildMapFeaturesGeojsonUrl("parcel");
const MAP_FEATURE_BUILDINGS_URL = buildMapFeaturesGeojsonUrl("building");
const DRAW_PRIMARY = "#F97316";
const DRAW_ACCENT = "#FDBA74";

const DRAW_STYLES = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": DRAW_PRIMARY,
      "fill-opacity": 0.22,
    },
  },
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": DRAW_PRIMARY,
      "line-width": 2.8,
      "line-opacity": 1,
    },
  },
  {
    id: "gl-draw-linestring",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": DRAW_PRIMARY,
      "line-width": 2.8,
      "line-opacity": 1,
    },
  },
  {
    id: "gl-draw-point-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 4,
      "circle-color": DRAW_ACCENT,
      "circle-opacity": 0.9,
    },
  },
  {
    id: "gl-draw-point-vertex-halo",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
    paint: {
      "circle-radius": 6.5,
      "circle-color": "#FFFFFF",
      "circle-opacity": 1,
    },
  },
  {
    id: "gl-draw-point-vertex",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
    paint: {
      "circle-radius": 4.5,
      "circle-color": DRAW_PRIMARY,
      "circle-opacity": 1,
    },
  },
  {
    id: "gl-draw-polygon-static-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    paint: {
      "fill-color": DRAW_PRIMARY,
      "fill-opacity": 0.14,
    },
  },
  {
    id: "gl-draw-polygon-static-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": DRAW_PRIMARY,
      "line-width": 2.2,
      "line-opacity": 0.95,
    },
  },
];

const MAP_FEATURE_LAYERS: LayerConfig[] = [
  {
    id: `${MAP_FEATURE_LAYER_PREFIX}-parcels`,
    name: "Parcelas desenhadas",
    group: "Cadastro Imobiliario",
    type: "vector",
    source: "api",
    dataUrl: MAP_FEATURE_PARCELS_URL,
    opacity: 0.4,
    visible: true,
    order: 12,
    geometryType: "polygon",
    style: {
      fillColor: "#3B8EA5",
      lineColor: "#1C5B6F",
      lineWidth: 1.6,
      labelField: "name",
    },
  },
  {
    id: `${MAP_FEATURE_LAYER_PREFIX}-buildings`,
    name: "Edificacoes desenhadas",
    group: "Cadastro Imobiliario",
    type: "vector",
    source: "api",
    dataUrl: MAP_FEATURE_BUILDINGS_URL,
    opacity: 0.35,
    visible: true,
    order: 13,
    geometryType: "polygon",
    style: {
      fillColor: "#D99258",
      lineColor: "#8E4B2C",
      lineWidth: 1.4,
      labelField: "name",
    },
  },
];

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeCenter = (value?: unknown): [number, number] | null => {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const lng = toFiniteNumber(value[0]);
  const lat = toFiniteNumber(value[1]);
  if (lng === null || lat === null) return null;
  return [lng, lat];
};

const normalizeBbox = (value?: unknown): [number, number, number, number] | null => {
  if (!Array.isArray(value) || value.length !== 4) return null;
  const minLng = toFiniteNumber(value[0]);
  const minLat = toFiniteNumber(value[1]);
  const maxLng = toFiniteNumber(value[2]);
  const maxLat = toFiniteNumber(value[3]);
  if (minLng === null || minLat === null || maxLng === null || maxLat === null) return null;
  return [minLng, minLat, maxLng, maxLat];
};

const isLocalLayerId = (id: string) => id.startsWith(MAP_FEATURE_LAYER_PREFIX);

const buildBboxFromMap = (map: MapLibreMap) => {
  const bounds = map.getBounds();
  return [
    bounds.getWest().toFixed(6),
    bounds.getSouth().toFixed(6),
    bounds.getEast().toFixed(6),
    bounds.getNorth().toFixed(6),
  ].join(",");
};

const ensureDrawLayersOnTop = (map: MapLibreMap) => {
  const layerIds = (map.getStyle().layers ?? []).map((layer) => layer.id);
  const drawLayerIds = layerIds.filter((id) => id.startsWith("gl-draw-"));
  drawLayerIds.forEach((id) => {
    if (map.getLayer(id)) {
      map.moveLayer(id);
    }
  });
};

const hasValidPolygonGeometry = (geometry: any) => {
  if (!geometry || geometry.type !== "Polygon") return false;
  const ring = geometry.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) return false;

  const uniqueVertices = new Set(
    ring
      .slice(0, -1)
      .filter((coord: any) => Array.isArray(coord) && coord.length >= 2)
      .map((coord: any) => `${Number(coord[0]).toFixed(8)},${Number(coord[1]).toFixed(8)}`),
  );

  if (uniqueVertices.size < 3) return false;
  return turfArea(geometry) > 0;
};

const isPointInsideRing = (point: [number, number], ring: [number, number][]) => {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
};

const withBboxPadding = (
  bbox: [number, number, number, number],
  lngPadding = 0.02,
  latPadding = 0.02,
): [number, number, number, number] => [
  bbox[0] - lngPadding,
  bbox[1] - latPadding,
  bbox[2] + lngPadding,
  bbox[3] + latPadding,
];

const bboxArea = (bbox: [number, number, number, number]) => {
  const width = Math.max(0, bbox[2] - bbox[0]);
  const height = Math.max(0, bbox[3] - bbox[1]);
  return width * height;
};

const isBboxInside = (
  candidate: [number, number, number, number],
  container: [number, number, number, number],
) =>
  candidate[0] >= container[0] &&
  candidate[1] >= container[1] &&
  candidate[2] <= container[2] &&
  candidate[3] <= container[3];

export default function MapsPage() {
  const queryClient = useQueryClient();
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const vectorLayerIdsRef = useRef<string[]>([]);
  const parcelLayerIdsRef = useRef<string[]>([]);
  const parcelHoverLayerIdsRef = useRef<string[]>([]);
  const parcelSelectedLayerIdsRef = useRef<string[]>([]);
  const mapDefaultsRef = useRef<MapDefaults>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    bounds: DEFAULT_BOUNDS,
  });
  const mapDefaultsKeyRef = useRef<string>("");
  const bboxCacheRef = useRef<Record<string, string>>({});
  const parcelFilterSpecRef = useRef<FilterSpecification | null>(null);
  const fetchTimeoutRef = useRef<number | null>(null);
  const lastHoverQueryAtRef = useRef<number>(0);
  const orderedLayerIdsSignatureRef = useRef<string>("");
  const drawControlRef = useRef<MapboxDraw | null>(null);
  const drawToolRef = useRef<"idle" | "parcel" | "building" | "rectangle" | "select" | "delete">("idle");
  const activeDrawTypeRef = useRef<"parcel" | "building" | "rectangle" | null>(null);
  const drawUpdateTimersRef = useRef<Record<string, number>>({});
  const [drawAreaM2, setDrawAreaM2] = useState<number | null>(null);

  const [layersState, setLayersState] = useState<LayerConfig[]>([]);
  const [geojsonCache, setGeojsonCache] = useState<Record<string, FeatureCollection>>({});
  const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [parcelTab, setParcelTab] = useState<"ctm" | "pgv">("ctm");
  const [drawTool, setDrawTool] = useState<"idle" | "parcel" | "building" | "rectangle" | "select" | "delete">("idle");
  const [pendingFeatureType, setPendingFeatureType] = useState<"parcel" | "building" | "rectangle" | null>(null);
  const [pendingGeometry, setPendingGeometry] = useState<Geometry | null>(null);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [drawForm, setDrawForm] = useState({
    name: "",
    description: "",
    status: "ATIVO",
  });
  const [selectedDrawFeatureId, setSelectedDrawFeatureId] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [drawReady, setDrawReady] = useState(false);
  const [mapRuntimeError, setMapRuntimeError] = useState<string | null>(null);
  const [parcelFilters, setParcelFilters] = useState({
    status: "all",
    zoneId: "all",
    minValue: "",
    maxValue: "",
  });

  const setCanvasCursor = (cursor: string) => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = cursor;
  };

  const solidPanelStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgb(var(--outline))",
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    backdropFilter: "blur(12px)",
  } as const;

  const enableDoubleClickZoom = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.doubleClickZoom.isEnabled()) {
      map.doubleClickZoom.enable();
    }
  };

  const disableDoubleClickZoom = () => {
    const map = mapRef.current;
    if (!map) return;
    if (map.doubleClickZoom.isEnabled()) {
      map.doubleClickZoom.disable();
    }
  };

  useEffect(() => {
    drawToolRef.current = drawTool;
  }, [drawTool]);

  const { data: layersData } = useQuery({
    queryKey: ["layers"],
    queryFn: () => apiFetch<LayerConfig[]>("/layers"),

  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectDefaults[]>("/projects"),

  });

  const { data: zonesData } = useQuery({
    queryKey: ["pgv-zones"],
    queryFn: () => apiFetch<ZoneOption[]>("/pgv/zones"),

  });

  const { data: parcelSummary } = useQuery({
    queryKey: ["parcel-summary", selectedParcelId],
    queryFn: () => apiFetch<ParcelSummary>(`/ctm/parcels/${selectedParcelId}/summary`),
    enabled: Boolean(selectedParcelId),
  });

  const { data: parcelValuations } = useQuery({
    queryKey: ["parcel-valuations", selectedParcelId],
    queryFn: () => apiFetch<ParcelValuation[]>(`/pgv/valuations/parcel/${selectedParcelId}`),
    enabled: Boolean(selectedParcelId),
  });

  const parcelAddress = useMemo(() => {
    const parcel = parcelSummary?.parcel;
    if (!parcel) return { line: "", location: "" };
    const endereco = parcel.enderecoPrincipal;
    const line =
      parcel.mainAddress ??
      [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", ");
    const location = [endereco?.bairro, endereco?.cidade, endereco?.uf].filter(Boolean).join(" - ");
    return { line, location };
  }, [parcelSummary]);

  const parcelArea = useMemo(() => {
    const parcel = parcelSummary?.parcel;
    return parcel?.areaTerreno ?? parcel?.area ?? 0;
  }, [parcelSummary]);

  const handleCalculatePgv = async () => {
    if (!selectedParcelId) return;
    try {
      await apiFetch("/pgv/valuations/calculate", {
        method: "POST",
        body: JSON.stringify({ parcelId: selectedParcelId, persist: true }),
      });
      await queryClient.invalidateQueries({
        queryKey: ["parcel-valuations", selectedParcelId],
      });
      toast.success("Calculo PGV concluido.");
    } catch {
      toast.error("Falha ao calcular PGV.");
    }
  };

  const updateMapFeatureCache = (
    id: string,
    updater: (feature: FeatureCollection["features"][number]) => FeatureCollection["features"][number],
  ) => {
    setGeojsonCache((prev) => {
      const next = { ...prev };
      [MAP_FEATURE_PARCELS_URL, MAP_FEATURE_BUILDINGS_URL].forEach((url) => {
        const collection = prev[url];
        if (!collection) return;
        let changed = false;
        const updatedFeatures = collection.features.map((feature) => {
          const featureId = String(feature.id ?? feature.properties?.mapFeatureId ?? "");
          if (featureId !== id) return feature;
          changed = true;
          return updater(feature);
        });
        if (changed) {
          next[url] = { ...collection, features: updatedFeatures };
        }
      });
      return next;
    });
  };

  const removeMapFeatureCache = (id: string) => {
    setGeojsonCache((prev) => {
      const next = { ...prev };
      [MAP_FEATURE_PARCELS_URL, MAP_FEATURE_BUILDINGS_URL].forEach((url) => {
        const collection = prev[url];
        if (!collection) return;
        const filtered = collection.features.filter((feature) => {
          const featureId = String(feature.id ?? feature.properties?.mapFeatureId ?? "");
          return featureId !== id;
        });
        if (filtered.length !== collection.features.length) {
          next[url] = { ...collection, features: filtered };
        }
      });
      return next;
    });
  };

  const refreshMapFeatures = async (types: MapFeatureType[] = ["parcel", "building"]) => {
    const map = mapRef.current;
    if (!map) return;
    const bbox = buildBboxFromMap(map);
    await Promise.all(
      types.map(async (type) => {
        try {
          const data = await fetchMapFeaturesGeojson(type, bbox);
          const url = type === "parcel" ? MAP_FEATURE_PARCELS_URL : MAP_FEATURE_BUILDINGS_URL;
          bboxCacheRef.current[url] = bbox;
          setGeojsonCache((prev) => ({ ...prev, [url]: data }));
        } catch {
          return;
        }
      }),
    );
  };

  const loadEditableFeatures = () => {
    const draw = drawControlRef.current;
    const map = mapRef.current;
    if (!draw || !map) return;
    draw.deleteAll();
    const parcelData = geojsonCache[MAP_FEATURE_PARCELS_URL];
    const buildingData = geojsonCache[MAP_FEATURE_BUILDINGS_URL];
    const features: FeatureCollection["features"] = [];
    if (parcelData?.features?.length) features.push(...parcelData.features);
    if (buildingData?.features?.length) features.push(...buildingData.features);
    if (features.length) {
      draw.add({ type: "FeatureCollection", features });
    }
  };

  const handleDrawStart = (type: "parcel" | "building" | "rectangle") => {
    const map = mapRef.current;
    const draw = drawControlRef.current;
    if (!map || !draw) {
      toast.error("Ferramenta de desenho ainda nao carregou. Tente novamente em 1 segundo.");
      return;
    }
    ensureDrawLayersOnTop(map);
    draw.changeMode(type === "rectangle" ? "draw_rectangle" : "draw_polygon");
    drawToolRef.current = type;
    activeDrawTypeRef.current = type;
    setDrawTool(type);
    setSelectedDrawFeatureId(null);
    setCanvasCursor("crosshair");
    disableDoubleClickZoom();
    toast.info("Clique para adicionar vertices; duplo clique finaliza.");
  };

  const handleSelectEditMode = async () => {
    const draw = drawControlRef.current;
    if (!draw) return;
    drawToolRef.current = "select";
    activeDrawTypeRef.current = null;
    setDrawTool("select");
    setSelectedDrawFeatureId(null);
    await loadEditableFeatures();
    draw.changeMode("simple_select");
    setCanvasCursor("cell");
    enableDoubleClickZoom();
  };

  const handleDeleteMode = async () => {
    const draw = drawControlRef.current;
    if (!draw) return;
    drawToolRef.current = "delete";
    activeDrawTypeRef.current = null;
    setDrawTool("delete");
    await loadEditableFeatures();

    if (selectedDrawFeatureId) {
      draw.delete(selectedDrawFeatureId as any);
      setSelectedDrawFeatureId(null);
    }

    draw.changeMode("simple_select");
    setCanvasCursor("not-allowed");
    enableDoubleClickZoom();
    toast.info("Modo excluir ativo: clique na geometria para apagar.");
  };

  const handleCancelDraw = () => {
    const draw = drawControlRef.current;
    if (draw) {
      draw.trash();
      draw.changeMode("simple_select");
    }
    setPendingFeatureType(null);
    setPendingGeometry(null);
    setSelectedDrawFeatureId(null);
    drawToolRef.current = "idle";
    setDrawTool("idle");
    setDrawForm({ name: "", description: "", status: "ATIVO" });
    setDrawModalOpen(false);
    setCanvasCursor("");
    enableDoubleClickZoom();
  };

  const handleSaveDraw = async () => {
    const featureType = pendingFeatureType;
    const draw = drawControlRef.current;
    if (!featureType || !pendingGeometry) {
      toast.error("Nenhuma geometria valida para salvar.");
      return;
    }
    if (!hasValidPolygonGeometry(pendingGeometry)) {
      toast.error("Desenho invalido. Use pelo menos 3 pontos distintos.");
      return;
    }

    const properties: Record<string, unknown> = {
      status: drawForm.status || "ATIVO",
    };
    if (drawForm.name.trim()) properties.name = drawForm.name.trim();
    if (drawForm.description.trim()) properties.description = drawForm.description.trim();

    try {
      await createMapFeature({
        featureType: featureType === "rectangle" ? "parcel" : featureType,
        geometry: pendingGeometry,
        properties,
      });
      await refreshMapFeatures([featureType === "rectangle" ? "parcel" : featureType]);
      setPendingFeatureType(null);
      setPendingGeometry(null);
      setSelectedDrawFeatureId(null);
      setDrawModalOpen(false);
      drawToolRef.current = "idle";
      setDrawTool("idle");
      setDrawForm({ name: "", description: "", status: "ATIVO" });
      if (draw) {
        draw.trash();
      }
      setCanvasCursor("");
      enableDoubleClickZoom();
      toast.success("Geometria salva com sucesso.");
    } catch {
      toast.error("Nao foi possivel salvar a geometria.");
    }
  };

  const mapDefaults = useMemo<MapDefaults>(() => {
    const project = projectsData?.find((item) => item.isDefault) ?? projectsData?.[0];
    const projectBbox = normalizeBbox(project?.defaultBbox);
    const allowedJalesEnvelope = withBboxPadding(JALES_BBOX, 0.02, 0.02);
    const projectBboxIsReasonable =
      !!projectBbox &&
      isBboxInside(projectBbox, allowedJalesEnvelope) &&
      bboxArea(projectBbox) > 0 &&
      bboxArea(projectBbox) <= bboxArea(allowedJalesEnvelope);
    const baseBbox = projectBboxIsReasonable ? (projectBbox as [number, number, number, number]) : JALES_BBOX;
    const bbox = withBboxPadding(baseBbox, 0.006, 0.006);
    const center = normalizeCenter(project?.defaultCenter) ?? DEFAULT_CENTER;
    const zoom = toFiniteNumber(project?.defaultZoom) ?? DEFAULT_ZOOM;
    const bounds: [[number, number], [number, number]] = [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ];
    return { center, zoom, bounds };
  }, [projectsData]);

  useEffect(() => {
    const key = `${mapDefaults.center.join(",")}:${mapDefaults.zoom}:${mapDefaults.bounds
      .flat()
      .join(",")}`;
    mapDefaultsRef.current = mapDefaults;
    if (key === mapDefaultsKeyRef.current) return;
    mapDefaultsKeyRef.current = key;
    const map = mapRef.current;
    if (!map) return;
    const [sw, ne] = mapDefaults.bounds;
    if (Number.isFinite(sw[0]) && Number.isFinite(sw[1]) && Number.isFinite(ne[0]) && Number.isFinite(ne[1])) {
      map.fitBounds(mapDefaults.bounds as LngLatBoundsLike, { padding: 24, duration: 500 });
      return;
    }
    map.flyTo({ center: mapDefaults.center as LngLatLike, zoom: mapDefaults.zoom });
  }, [mapDefaults]);

  useEffect(() => {
    if (layersData) {
      setLayersState([...layersData, ...MAP_FEATURE_LAYERS]);
    }
  }, [layersData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !layersState.length) return;

    const vectorLayers = layersState.filter((layer) => layer.type === "vector" && layer.dataUrl);

    const fetchForBounds = () => {
      const bbox = buildBboxFromMap(map);

      vectorLayers.forEach((layer) => {
        const url = layer.dataUrl as string;
        if (bboxCacheRef.current[url] === bbox) return;
        bboxCacheRef.current[url] = bbox;

        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set("bbox", bbox);
        const urlWithBbox = `${urlObj.pathname}${urlObj.search}`;

        apiFetch<FeatureCollection>(urlWithBbox)
          .then((data) => {
            setGeojsonCache((prev) => ({ ...prev, [url]: data }));
          })
          .catch(() => undefined);
      });
    };

    const scheduleFetch = () => {
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = window.setTimeout(fetchForBounds, 300);
    };

    fetchForBounds();
    map.on("moveend", scheduleFetch);
    map.on("zoomend", scheduleFetch);

    return () => {
      map.off("moveend", scheduleFetch);
      map.off("zoomend", scheduleFetch);
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [layersState, mapReady]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const supported =
      typeof (maplibregl as unknown as { supported?: (options?: unknown) => boolean }).supported === "function"
        ? (maplibregl as unknown as { supported: (options?: unknown) => boolean }).supported({
            failIfMajorPerformanceCaveat: false,
          })
        : true;
    if (!supported) {
      setMapRuntimeError("WebGL indisponivel neste ambiente.");
      return;
    }

    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          sources: {},
          layers: [{ id: "background", type: "background", paint: { "background-color": "#F7F2E9" } }],
        },
        center: mapDefaultsRef.current.center as LngLatLike,
        zoom: mapDefaultsRef.current.zoom,
      });
      setMapRuntimeError(null);
    } catch (error) {
      setMapRuntimeError("WebGL indisponivel neste ambiente.");
      appLogger.warn("maps", "maplibre_init_error", {
        message: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    const handleError = (e: any) => {
      const message = String(e?.error?.message ?? e?.error ?? e ?? "");
      if (/failed to initialize webgl|webglcontextcreationerror/i.test(message)) {
        setMapRuntimeError("WebGL indisponivel neste ambiente.");
      }
      appLogger.warn("maps", "maplibre_runtime_error", {
        message,
      });
    };
    map.on("error", handleError);

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    const drawControl = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
      modes: { ...MapboxDraw.modes },
      styles: DRAW_STYLES as any,
    });
    map.addControl(drawControl, "top-left");
    drawControlRef.current = drawControl;

    const handleDrawCreate = (e: any) => {
      const draw = drawControlRef.current;
      if (!draw) return;
      const feature = e.features?.[0];
      if (!feature) return;
      if (!hasValidPolygonGeometry(feature.geometry)) {
        toast.error("Desenho invalido. Use pelo menos 3 pontos distintos.");
        draw.trash();
        draw.changeMode("draw_polygon");
        setPendingGeometry(null);
        setSelectedDrawFeatureId(null);
        setCanvasCursor("crosshair");
        return;
      }

      const geomArea = turfArea(feature.geometry as any);
      const featureId = feature.id ? String(feature.id) : null;
      setPendingGeometry(feature.geometry as Geometry);
      setSelectedDrawFeatureId(featureId);
      setDrawAreaM2(geomArea);
      setPendingFeatureType(activeDrawTypeRef.current ?? "parcel");
      setDrawForm({ name: "", description: "", status: "ATIVO" });
      setDrawModalOpen(true);
      setDrawTool("idle");
      activeDrawTypeRef.current = null;
      if (featureId) {
        draw.changeMode("simple_select", { featureIds: [featureId] });
      } else {
        draw.changeMode("simple_select");
      }
      setCanvasCursor("cell");
      enableDoubleClickZoom();
    };

    const handleDrawUpdate = (e: any) => {
      const draw = drawControlRef.current;
      if (!draw) return;
      const feature = e.features?.[0];
      if (!feature || !feature.id) return;
      const key = String(feature.id);
      const existing = drawUpdateTimersRef.current[key];
      if (existing) window.clearTimeout(existing);

      drawUpdateTimersRef.current[key] = window.setTimeout(async () => {
        try {
          await updateMapFeature(key, { geometry: feature.geometry as Geometry });
          updateMapFeatureCache(key, (prev) => ({ ...prev, geometry: feature.geometry as Geometry }));
        } catch {
          /* ignore */
        } finally {
          delete drawUpdateTimersRef.current[key];
        }
      }, 300);
    };

    const handleDrawDelete = (e: any) => {
      const ids = (e.features || []).map((f: any) => f.id).filter(Boolean);
      ids.forEach((id: any) => {
        const key = String(id);
        deleteMapFeature(key).catch(() => undefined);
        removeMapFeatureCache(key);
      });
      if (ids.length > 0) {
        toast.success(ids.length === 1 ? "Geometria excluida." : `${ids.length} geometrias excluidas.`);
      }
      setPendingGeometry(null);
      setSelectedDrawFeatureId(null);
    };

    const handleDrawSelectionChange = (e: any) => {
      const selected = e.features?.[0];
      setSelectedDrawFeatureId(selected?.id ? String(selected.id) : null);
    };

    map.on("click", (event) => {
      if (drawToolRef.current === "delete") {
        const draw = drawControlRef.current;
        if (draw) {
          const ids = ((draw as any).getFeatureIdsAt?.(event.point) ?? []) as string[];
          if (ids.length > 0) {
            draw.delete(ids as any);
            return;
          }

          const allFeatures = ((draw as any).getAll?.()?.features ?? []) as Array<{
            id?: string | number;
            geometry?: { type?: string; coordinates?: unknown };
          }>;
          const clickPoint: [number, number] = [event.lngLat.lng, event.lngLat.lat];
          const fallbackIds = allFeatures
            .filter((feature) => feature?.id && feature?.geometry?.type === "Polygon")
            .filter((feature) => {
              const ring = (feature.geometry?.coordinates as unknown as [number, number][][])?.[0];
              return Array.isArray(ring) && ring.length >= 4 && isPointInsideRing(clickPoint, ring);
            })
            .map((feature) => String(feature.id));
          if (fallbackIds.length > 0) {
            draw.delete(fallbackIds as any);
            return;
          }
        }

        const localLayerIds = (map.getStyle().layers ?? [])
          .map((layer) => layer.id)
          .filter((id) => id.startsWith(MAP_FEATURE_LAYER_PREFIX));
        if (localLayerIds.length > 0) {
          const rendered = map.queryRenderedFeatures(event.point, { layers: localLayerIds });
          const ids = [
            ...new Set(
              rendered
                .map((feature) => String(feature.properties?.mapFeatureId ?? feature.id ?? ""))
                .filter((id) => id.length > 0),
            ),
          ];
          if (ids.length > 0) {
            void (async () => {
              await Promise.all(
                ids.map(async (id) => {
                  try {
                    await deleteMapFeature(id);
                    removeMapFeatureCache(id);
                  } catch {
                    /* ignore */
                  }
                }),
              );
              setSelectedDrawFeatureId(null);
              toast.success(ids.length === 1 ? "Geometria excluida." : `${ids.length} geometrias excluidas.`);
            })();
          }
        }
        return;
      }

      if (drawToolRef.current !== "idle") return;
      const vectorLayerIds = vectorLayerIdsRef.current;
      if (vectorLayerIds.length === 0) {
        setSelectedFeature(null);
        setSelectedParcelId(null);
        return;
      }
      const features = map.queryRenderedFeatures(event.point, { layers: vectorLayerIds });
      const feature = features[0];
      if (feature?.properties) {
        setSelectedFeature(feature.properties as Record<string, unknown>);
        const featureType = feature.properties.featureType as string | undefined;
        if (featureType === "parcel") {
          const parcelId = feature.properties.parcelId as string | undefined;
          setSelectedParcelId(parcelId ?? null);
        } else {
          setSelectedParcelId(null);
        }
      } else {
        setSelectedFeature(null);
        setSelectedParcelId(null);
      }
    });

    map.on("mousemove", (event) => {
      const currentDrawTool = drawToolRef.current;
      if (currentDrawTool === "parcel" || currentDrawTool === "building") {
        map.getCanvas().style.cursor = "crosshair";
        return;
      }
      if (currentDrawTool === "delete") {
        map.getCanvas().style.cursor = "not-allowed";
        return;
      }
      if (currentDrawTool === "select") {
        map.getCanvas().style.cursor = "cell";
        return;
      }

      const layers = parcelLayerIdsRef.current;
      if (layers.length === 0) {
        setHoveredParcelId(null);
        map.getCanvas().style.cursor = "";
        return;
      }
      const now = performance.now();
      if (now - lastHoverQueryAtRef.current < 33) {
        return;
      }
      lastHoverQueryAtRef.current = now;
      const features = map.queryRenderedFeatures(event.point, { layers });
      const feature = features[0];
      if (feature?.properties) {
        const parcelId = feature.properties.parcelId as string | undefined;
        setHoveredParcelId(parcelId ?? null);
        map.getCanvas().style.cursor = parcelId ? "pointer" : "";
      } else {
        setHoveredParcelId(null);
        map.getCanvas().style.cursor = "";
      }
    });

    map.on("mouseleave", () => {
      setHoveredParcelId(null);
      map.getCanvas().style.cursor = "";
    });

    const initializeDraw = () => {
      const draw = drawControlRef.current;
      if (!draw) return;
      setDrawReady(true);
      ensureDrawLayersOnTop(map);

      map.on("draw.create", handleDrawCreate);
      map.on("draw.update", handleDrawUpdate);
      map.on("draw.delete", handleDrawDelete);
      map.on("draw.selectionchange", handleDrawSelectionChange);
    };

    if (map.isStyleLoaded()) {
      initializeDraw();
    } else {
      map.once("load", initializeDraw);
    }

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.off("draw.create", handleDrawCreate);
      map.off("draw.update", handleDrawUpdate);
      map.off("draw.delete", handleDrawDelete);
      map.off("draw.selectionchange", handleDrawSelectionChange);
      map.off("error", handleError);
      enableDoubleClickZoom();
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      setDrawReady(false);
      Object.values(drawUpdateTimersRef.current).forEach((timer) => window.clearTimeout(timer));
      drawUpdateTimersRef.current = {};
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || layersState.length === 0) return;

    const applyLayers = () => {
      const style = map.getStyle();
      const desiredLayerIds = new Set<string>();
      const desiredSourceIds = new Set<string>();
      const orderedLayers = [...layersState].sort((a, b) => a.order - b.order);

      vectorLayerIdsRef.current = [];
      parcelLayerIdsRef.current = [];
      parcelHoverLayerIdsRef.current = [];
      parcelSelectedLayerIdsRef.current = [];

      orderedLayers.forEach((layer) => {
        const sourceId = `layer-${layer.id}`;
        const layerId = `layer-${layer.id}`;
        const outlineId = `layer-${layer.id}-outline`;
        const labelId = `layer-${layer.id}-label`;

        if (layer.type === "raster" || layer.type === "basemap") {
          if (!layer.tileUrl) return;
          desiredSourceIds.add(sourceId);
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: "raster",
              tiles: [layer.tileUrl],
              tileSize: 256,
            });
          }
          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "raster",
              source: sourceId,
              paint: {
                "raster-opacity": layer.opacity,
              },
              ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
              ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
              layout: {
                visibility: layer.visible ? "visible" : "none",
              },
            });
          } else {
            map.setPaintProperty(layerId, "raster-opacity", layer.opacity);
            map.setLayoutProperty(layerId, "visibility", layer.visible ? "visible" : "none");
          }
          desiredLayerIds.add(layerId);
        }

        if (layer.type === "vector" && layer.dataUrl) {
          const data = geojsonCache[layer.dataUrl] ?? EMPTY_FEATURE_COLLECTION;
          const geometryType = String(
            layer.geometryType ?? data.features[0]?.geometry?.type ?? "",
          ).toLowerCase();
          const isPoint = geometryType === "point" || geometryType === "multipoint";
          const isLine =
            geometryType === "line" ||
            geometryType === "linestring" ||
            geometryType === "multilinestring";
          desiredSourceIds.add(sourceId);
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: "geojson",
              data,
            });
          } else {
            const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
            source.setData(data);
          }

          const fillColor = layer.style?.fillColor ?? "#2D9C97";
          const lineColor = layer.style?.lineColor ?? "#135B66";
          const lineWidth = layer.style?.lineWidth ?? 1.2;
          const labelField = layer.style?.labelField ?? "name";

          if (isPoint) {
            if (!map.getLayer(layerId)) {
              map.addLayer({
                id: layerId,
                type: "circle",
                source: sourceId,
                paint: {
                  "circle-color": ["coalesce", ["get", "color"], fillColor],
                  "circle-radius": 6,
                  "circle-opacity": layer.opacity,
                  "circle-stroke-color": lineColor,
                  "circle-stroke-width": 1,
                },
                layout: {
                  visibility: layer.visible ? "visible" : "none",
                },
                ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
                ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
              });
            } else {
              map.setPaintProperty(layerId, "circle-opacity", layer.opacity);
              map.setLayoutProperty(layerId, "visibility", layer.visible ? "visible" : "none");
            }
          } else if (isLine) {
            if (!map.getLayer(layerId)) {
              map.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": lineColor,
                  "line-width": lineWidth,
                  "line-opacity": layer.opacity,
                },
                layout: {
                  visibility: layer.visible ? "visible" : "none",
                },
                ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
                ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
              });
            } else {
              map.setPaintProperty(layerId, "line-opacity", layer.opacity);
              map.setLayoutProperty(layerId, "visibility", layer.visible ? "visible" : "none");
            }
          } else {
            if (!map.getLayer(layerId)) {
              map.addLayer({
                id: layerId,
                type: "fill",
                source: sourceId,
                paint: {
                  "fill-color": ["coalesce", ["get", "color"], fillColor],
                  "fill-opacity": layer.opacity,
                },
                layout: {
                  visibility: layer.visible ? "visible" : "none",
                },
                ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
                ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
              });
            } else {
              map.setPaintProperty(layerId, "fill-opacity", layer.opacity);
              map.setLayoutProperty(layerId, "visibility", layer.visible ? "visible" : "none");
            }

            if (!map.getLayer(outlineId)) {
              map.addLayer({
                id: outlineId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": lineColor,
                  "line-width": lineWidth,
                  "line-opacity": layer.opacity,
                },
                layout: {
                  visibility: layer.visible ? "visible" : "none",
                },
                ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
                ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
              });
            } else {
              map.setPaintProperty(outlineId, "line-opacity", layer.opacity);
              map.setLayoutProperty(outlineId, "visibility", layer.visible ? "visible" : "none");
            }
          }

          if (!map.getLayer(labelId)) {
            map.addLayer({
              id: labelId,
              type: "symbol",
              source: sourceId,
              layout: {
                "text-field": ["get", labelField],
                "text-size": 12,
                "text-offset": [0, 0.6],
                "symbol-placement": isLine ? "line" : "point",
                visibility: layer.visible ? "visible" : "none",
              },
              paint: {
                "text-color": "#0B1220",
                "text-halo-color": "#F7F2E9",
                "text-halo-width": 1,
              },
              ...(layer.minZoom !== undefined ? { minzoom: layer.minZoom } : {}),
              ...(layer.maxZoom !== undefined ? { maxzoom: layer.maxZoom } : {}),
            });
          } else {
            map.setLayoutProperty(labelId, "visibility", layer.visible ? "visible" : "none");
          }

          desiredLayerIds.add(layerId);
          if (!isPoint && !isLine) {
            desiredLayerIds.add(outlineId);
          }
          desiredLayerIds.add(labelId);
          vectorLayerIdsRef.current.push(layerId);
          if (layer.dataUrl.includes("/pgv/valuations/export/geojson")) {
            parcelLayerIdsRef.current.push(layerId, labelId);
            if (!isPoint && !isLine) {
              parcelLayerIdsRef.current.push(outlineId);
            }

            const hoverId = `${layerId}-hover`;
            const selectedId = `${layerId}-selected`;

            if (!map.getLayer(hoverId)) {
              map.addLayer({
                id: hoverId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": "#F2B77A",
                  "line-width": 2.5,
                },
                layout: { visibility: layer.visible ? "visible" : "none" },
                filter: ["==", ["get", "parcelId"], ""],
              });
            } else {
              map.setLayoutProperty(hoverId, "visibility", layer.visible ? "visible" : "none");
            }

            if (!map.getLayer(selectedId)) {
              map.addLayer({
                id: selectedId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": "#0B5560",
                  "line-width": 3,
                },
                layout: { visibility: layer.visible ? "visible" : "none" },
                filter: ["==", ["get", "parcelId"], ""],
              });
            } else {
              map.setLayoutProperty(selectedId, "visibility", layer.visible ? "visible" : "none");
            }

            desiredLayerIds.add(hoverId);
            desiredLayerIds.add(selectedId);
            parcelHoverLayerIdsRef.current.push(hoverId);
            parcelSelectedLayerIdsRef.current.push(selectedId);
          }
        }
      });

      (style.layers ?? []).forEach((layer) => {
        if (layer.id.startsWith("layer-") && !desiredLayerIds.has(layer.id)) {
          map.removeLayer(layer.id);
        }
      });

      Object.keys(style.sources ?? {}).forEach((sourceId) => {
        if (sourceId.startsWith("layer-") && !desiredSourceIds.has(sourceId)) {
          map.removeSource(sourceId);
        }
      });

      const orderedLayerIds: string[] = [];
      orderedLayers.forEach((layer) => {
        const baseId = `layer-${layer.id}`;
        if (layer.type === "vector") {
          const data = layer.dataUrl ? geojsonCache[layer.dataUrl] : undefined;
          const geometryType = String(
            layer.geometryType ?? data?.features?.[0]?.geometry?.type ?? "",
          ).toLowerCase();
          const isPoint = geometryType === "point" || geometryType === "multipoint";
          const isLine =
            geometryType === "line" ||
            geometryType === "linestring" ||
            geometryType === "multilinestring";
          if (isPoint || isLine) {
            orderedLayerIds.push(baseId, `${baseId}-label`);
          } else {
            orderedLayerIds.push(baseId, `${baseId}-outline`, `${baseId}-label`);
          }
          if (layer.dataUrl?.includes("/pgv/valuations/export/geojson")) {
            orderedLayerIds.push(`${baseId}-hover`, `${baseId}-selected`);
          }
        } else {
          orderedLayerIds.push(baseId);
        }
      });
      const orderSignature = orderedLayerIds.join("|");
      if (orderedLayerIdsSignatureRef.current !== orderSignature) {
        orderedLayerIds.forEach((layerId) => {
          if (map.getLayer(layerId)) {
            map.moveLayer(layerId);
          }
        });
        orderedLayerIdsSignatureRef.current = orderSignature;
      }
      ensureDrawLayersOnTop(map);
    };

    if (!map.isStyleLoaded()) {
      map.once("load", applyLayers);
    } else {
      applyLayers();
    }
  }, [layersState, geojsonCache]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const filters: unknown[] = ["all"];
    if (parcelFilters.status !== "all") {
      filters.push(["==", ["get", "status"], parcelFilters.status]);
    }
    if (parcelFilters.zoneId !== "all") {
      filters.push(["==", ["get", "zoneId"], parcelFilters.zoneId]);
    }
    const minValue = Number(parcelFilters.minValue);
    if (!Number.isNaN(minValue) && parcelFilters.minValue !== "") {
      filters.push([">=", ["get", "valor_venal"], minValue]);
    }
    const maxValue = Number(parcelFilters.maxValue);
    if (!Number.isNaN(maxValue) && parcelFilters.maxValue !== "") {
      filters.push(["<=", ["get", "valor_venal"], maxValue]);
    }
    const filterExpression: FilterSpecification | null =
      filters.length > 1 ? (filters as FilterSpecification) : null;
    parcelFilterSpecRef.current = filterExpression;
    parcelLayerIdsRef.current.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, filterExpression);
      }
    });
  }, [parcelFilters]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const baseFilter = parcelFilterSpecRef.current;
    const hoverFilter = hoveredParcelId
      ? (["==", ["get", "parcelId"], hoveredParcelId] as FilterSpecification)
      : (["==", ["get", "parcelId"], ""] as FilterSpecification);
    const filter = baseFilter
      ? (["all", baseFilter, hoverFilter] as FilterSpecification)
      : hoverFilter;
    parcelHoverLayerIdsRef.current.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, filter);
      }
    });
  }, [hoveredParcelId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const baseFilter = parcelFilterSpecRef.current;
    const selectedFilter = selectedParcelId
      ? (["==", ["get", "parcelId"], selectedParcelId] as FilterSpecification)
      : (["==", ["get", "parcelId"], ""] as FilterSpecification);
    const filter = baseFilter
      ? (["all", baseFilter, selectedFilter] as FilterSpecification)
      : selectedFilter;
    parcelSelectedLayerIdsRef.current.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, filter);
      }
    });
  }, [selectedParcelId]);

  const groupedLayers = useMemo(() => {
    const groups = new Map<string, LayerConfig[]>();
    layersState.forEach((layer) => {
      if (!groups.has(layer.group)) {
        groups.set(layer.group, []);
      }
      groups.get(layer.group)?.push(layer);
    });
    return Array.from(groups.entries()).map(([group, items]) => ({
      group,
      items: items.sort((a, b) => a.order - b.order),
    }));
  }, [layersState]);

  const layerSummary = useMemo(() => {
    const basemaps = layersState.filter((layer) => layer.type === "basemap").length;
    const rasters = layersState.filter((layer) => layer.type === "raster").length;
    const vectors = layersState.filter((layer) => layer.type === "vector").length;
    return { basemaps, rasters, vectors };
  }, [layersState]);

  const hasVisibleOperationalLayers = useMemo(
    () => layersState.some((layer) => layer.visible && layer.type !== "basemap"),
    [layersState],
  );

  const updateLayer = async (id: string, patch: Partial<LayerConfig>) => {
    setLayersState((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
    if (isLocalLayerId(id)) return;
    try {
      await apiFetch(`/layers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      toast.error("Nao foi possivel atualizar a camada.");
      return;
    }
  };

  const toggleLayer = async (layer: LayerConfig) => {
    if (layer.type === "basemap") {
      const updates = layersState
        .filter((item) => item.type === "basemap")
        .map((item) => ({
          id: item.id,
          visible: item.id === layer.id,
        }));
      setLayersState((prev) =>
        prev.map((item) =>
          item.type === "basemap" ? { ...item, visible: item.id === layer.id } : item
        )
      );
      await Promise.all(
        updates.map((item) =>
          apiFetch(`/layers/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify({ visible: item.visible }),
          }).catch(() => {
            toast.error("Falha ao atualizar basemap.");
            return undefined;
          })
        )
      );
      return;
    }

    await updateLayer(layer.id, { visible: !layer.visible });
  };

  const moveLayer = async (group: string, id: string, direction: "up" | "down") => {
    const groupLayers = layersState
      .filter((layer) => layer.group === group && layer.type !== "basemap")
      .sort((a, b) => a.order - b.order);
    const index = groupLayers.findIndex((layer) => layer.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= groupLayers.length) return;

    const current = groupLayers[index];
    const target = groupLayers[swapIndex];
    const currentOrder = current.order;
    const targetOrder = target.order;

    setLayersState((prev) =>
      prev.map((layer) => {
        if (layer.id === current.id) return { ...layer, order: targetOrder };
        if (layer.id === target.id) return { ...layer, order: currentOrder };
        return layer;
      })
    );

    const updates: Promise<unknown>[] = [];
    if (!isLocalLayerId(current.id)) {
      updates.push(
        apiFetch(`/layers/${current.id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: targetOrder }),
        }).catch(() => undefined),
      );
    }
    if (!isLocalLayerId(target.id)) {
      updates.push(
        apiFetch(`/layers/${target.id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: currentOrder }),
        }).catch(() => undefined),
      );
    }
    await Promise.all(updates);
  };

  const handleResetView = () => {
    const defaults = mapDefaultsRef.current;
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(defaults.bounds as LngLatBoundsLike, { padding: 24, duration: 500 });
  };

  const rightPanelOpen = Boolean(selectedParcelId) || Boolean(selectedFeature);

  return (
    <div className="relative flex h-full animate-fade-in overflow-hidden motion-reduce:animate-none">
      {/* ── Left Panel (Layers + Filters) ── */}
      <div
        className={`absolute inset-y-0 left-0 z-20 flex w-80 flex-col border-r border-outline bg-[rgb(var(--surface-elevated))] opacity-100 shadow-2 transition-transform duration-slow ease-standard ${
          leftPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={solidPanelStyle}
      >
        <div className="flex items-center justify-between border-b border-outline px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <Layers className="h-4 w-4" />
            Camadas & Filtros
          </div>
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="rounded-md p-1 text-on-surface-muted hover:bg-cloud"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Layers */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Camadas</p>
            {groupedLayers.map((group) => (
              <div key={group.group} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">
                  {group.group}
                </p>
                {group.items.map((layer) => (
                  <div
                    key={layer.id}
                    className="rounded-md border border-outline bg-[rgb(var(--surface-elevated))] p-3 text-sm"
                    style={solidPanelStyle}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-on-surface">{layer.name}</p>
                        <p className="text-xs text-on-surface-muted">
                          {layer.type === "raster" ? "Raster" : layer.type === "basemap" ? "Base" : "Vetor"}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleLayer(layer)}
                        className={`h-6 w-11 shrink-0 rounded-full border transition-colors ${
                          layer.visible ? "border-accent bg-accent/20" : "border-outline bg-cloud"
                        }`}
                        aria-label={`Alternar camada ${layer.name}`}
                      >
                        <span
                          className={`block h-5 w-5 rounded-full bg-surface-elevated shadow transition-transform ${
                            layer.visible ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {layer.type !== "basemap" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-on-surface-muted">
                          <span>Opacidade</span>
                          <span>{Math.round(layer.opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(layer.opacity * 100)}
                          onChange={(event) => {
                            const value = Number(event.target.value) / 100;
                            setLayersState((prev) =>
                              prev.map((item) =>
                                item.id === layer.id ? { ...item, opacity: value } : item
                              )
                            );
                          }}
                          onMouseUp={(event) => {
                            const value = Number((event.target as HTMLInputElement).value) / 100;
                            updateLayer(layer.id, { opacity: value }).catch(() => undefined);
                          }}
                          onTouchEnd={(event) => {
                            const value = Number((event.target as HTMLInputElement).value) / 100;
                            updateLayer(layer.id, { opacity: value }).catch(() => undefined);
                          }}
                          className="w-full"
                        />
                      </div>
                    )}

                    {layer.type !== "basemap" && (
                      <div className="mt-3 flex items-center justify-between text-xs text-on-surface-muted">
                        <span>Ordem</span>
                        <div className="flex gap-1">
                          <button
                            className="rounded-sm border border-outline px-2 py-0.5 text-xs hover:bg-cloud"
                            onClick={() => moveLayer(group.group, layer.id, "up")}
                          >
                            Up
                          </button>
                          <button
                            className="rounded-sm border border-outline px-2 py-0.5 text-xs hover:bg-cloud"
                            onClick={() => moveLayer(group.group, layer.id, "down")}
                          >
                            Down
                          </button>
                        </div>
                      </div>
                    )}

                    {layer.legendUrl && layer.visible && (
                      <div className="mt-3 rounded-sm border border-outline bg-cloud p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={layer.legendUrl} alt={`Legenda ${layer.name}`} className="w-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Filtros</p>
            <div className="space-y-2">
              <label className="text-xs text-on-surface-muted">Status cadastral</label>
              <select
                className="w-full rounded-sm border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface"
                value={parcelFilters.status}
                onChange={(event) =>
                  setParcelFilters((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="all">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="CONFLITO">Conflito</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-on-surface-muted">Zona de valor</label>
              <select
                className="w-full rounded-sm border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface"
                value={parcelFilters.zoneId}
                onChange={(event) =>
                  setParcelFilters((prev) => ({ ...prev, zoneId: event.target.value }))
                }
              >
                <option value="all">Todas</option>
                {(zonesData ?? []).map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.code ?? "-"} - {zone.nome ?? zone.name ?? "-"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-on-surface-muted">Faixa valor venal (R$)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={parcelFilters.minValue}
                  onChange={(event) =>
                    setParcelFilters((prev) => ({ ...prev, minValue: event.target.value }))
                  }
                  placeholder="Min"
                />
                <Input
                  value={parcelFilters.maxValue}
                  onChange={(event) =>
                    setParcelFilters((prev) => ({ ...prev, maxValue: event.target.value }))
                  }
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Map (full-bleed) ── */}
      <div className="flex-1 relative">
        {mapRuntimeError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface/90 px-6">
            <div className="max-w-lg rounded-lg border border-outline bg-surface-elevated p-5 text-center shadow-3">
              <p className="text-sm font-semibold text-on-surface">Mapa indisponivel neste ambiente</p>
              <p className="mt-2 text-xs text-on-surface-muted">{mapRuntimeError}</p>
              <p className="mt-1 text-xs text-on-surface-muted">
                Para usar o modulo GIS, execute em navegador com suporte WebGL.
              </p>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} data-testid="maps-canvas-container" className="absolute inset-0" />

        {!hasVisibleOperationalLayers && (
          <div className="pointer-events-none absolute inset-0 z-[9] flex items-center justify-center bg-surface/45 backdrop-blur-[1px]">
            <div className="rounded-md border border-outline bg-surface-elevated/95 px-6 py-5 text-center shadow-2">
              <p className="text-sm font-semibold text-on-surface">Adicione camadas para visualizar dados</p>
              <p className="mt-1 text-xs text-on-surface-muted">Ative camadas no painel lateral para começar.</p>
            </div>
          </div>
        )}

        {/* Left panel toggle */}
        {!leftPanelOpen && (
          <button
            onClick={() => setLeftPanelOpen(true)}
            className="absolute left-3 top-3 z-10 rounded-md bg-surface-elevated p-2 shadow-2 hover:bg-cloud"
          >
            <PanelLeftOpen className="h-4 w-4 text-on-surface" />
          </button>
        )}

        {/* Filter chips overlay */}
        <div className={`absolute top-3 z-10 flex flex-wrap items-center gap-2 ${leftPanelOpen ? "left-[336px]" : "left-14"}`}>
          <Badge variant="info">Basemaps: {layerSummary.basemaps}</Badge>
          <Badge variant="default">Raster: {layerSummary.rasters}</Badge>
          <Badge variant="default">Vetores: {layerSummary.vectors}</Badge>
          <Button data-testid="maps-reset-view" size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleResetView}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Draw tools overlay */}
        <div
          className={`absolute top-14 z-10 w-52 rounded-md border border-outline bg-[rgb(var(--surface-elevated))] p-3 shadow-2 ${leftPanelOpen ? "left-[336px]" : "left-3"}`}
          style={solidPanelStyle}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Desenho</p>
          <div className="mt-2 grid gap-1.5">
            <Button
              data-testid="maps-draw-parcel"
              size="sm"
              variant={drawTool === "parcel" ? "primary" : "outline"}
              onClick={() => handleDrawStart("parcel")}
              disabled={!drawReady}
            >
              <PencilRuler className="h-3.5 w-3.5" />
              Desenhar Terreno
            </Button>
            <Button
              data-testid="maps-draw-building"
              size="sm"
              variant={drawTool === "building" ? "primary" : "outline"}
              onClick={() => handleDrawStart("building")}
              disabled={!drawReady}
            >
              <Building2 className="h-3.5 w-3.5" />
              Desenhar Edificacao
            </Button>
            <Button
              data-testid="maps-select-edit"
              size="sm"
              variant={drawTool === "select" ? "primary" : "outline"}
              onClick={handleSelectEditMode}
              disabled={!drawReady}
            >
              <MousePointer2 className="h-3.5 w-3.5" />
              Selecionar/Editar
            </Button>
            <Button
              data-testid="maps-delete-feature"
              size="sm"
              variant={drawTool === "delete" ? "primary" : "outline"}
              onClick={handleDeleteMode}
              disabled={!drawReady}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </Button>
          </div>
          {(drawTool === "parcel" || drawTool === "building") && (
            <p className="mt-2 text-[11px] text-on-surface-muted">
              Clique esquerdo adiciona vértice; duplo clique finaliza; ESC cancela.
            </p>
          )}
          {selectedDrawFeatureId && (
            <div className="mt-2">
              <Badge variant="info">Selecionado</Badge>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel (Detail — slides in) ── */}
      <div
        className={`absolute inset-y-0 right-0 z-20 flex w-[360px] flex-col border-l border-outline bg-[rgb(var(--surface-elevated))] shadow-3 transition-transform duration-slow ease-standard ${
          rightPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={solidPanelStyle}
      >
        <div className="flex items-center justify-between border-b border-outline px-4 py-3">
          <p className="text-sm font-semibold text-on-surface">Detalhes</p>
          <button
            onClick={() => { setSelectedParcelId(null); setSelectedFeature(null); }}
            className="rounded-md p-1 text-on-surface-muted hover:bg-cloud"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Identify section */}
          {selectedFeature && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Identify</p>
              {Object.entries(selectedFeature).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-muted">{key}</span>
                  <span className="text-on-surface">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Parcel detail section */}
          {selectedParcelId && (
            <div className="space-y-4 text-sm text-on-surface-muted">
              {parcelSummary ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={parcelTab === "ctm" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setParcelTab("ctm")}
                    >
                      CTM
                    </Button>
                    <Button
                      variant={parcelTab === "pgv" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setParcelTab("pgv")}
                    >
                      PGV
                    </Button>
                  </div>

                  {parcelTab === "ctm" ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Parcela</p>
                        <p className="font-semibold text-on-surface">{parcelSummary.parcel.sqlu}</p>
                        <p>{parcelAddress.line || "-"}</p>
                        {parcelAddress.location && <p>{parcelAddress.location}</p>}
                        <p>
                          Inscricao:{" "}
                          {parcelSummary.parcel.inscricaoImobiliaria ??
                            parcelSummary.parcel.inscription ??
                            "-"}
                        </p>
                        <p>
                          Status:{" "}
                          {parcelSummary.parcel.statusCadastral ??
                            parcelSummary.parcel.status ??
                            "-"}
                        </p>
                        <p>Area: {parcelArea.toFixed(2)} m²</p>
                      </div>

                      {parcelSummary.building && (
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted">
                            Cadastro predial
                          </p>
                          <p>
                            Uso:{" "}
                            {parcelSummary.building.uso ??
                              parcelSummary.building.useType ??
                              "-"}
                          </p>
                          <p>
                            Padrao:{" "}
                            {parcelSummary.building.padraoConstrutivo ??
                              parcelSummary.building.constructionStandard ??
                              "-"}
                          </p>
                          <p>
                            Area construida:{" "}
                            {parcelSummary.building.areaConstruida ??
                              parcelSummary.building.builtArea ??
                              0}{" "}
                            m²
                          </p>
                          <p>
                            Pavimentos:{" "}
                            {parcelSummary.building.pavimentos ??
                              parcelSummary.building.floors ??
                              "-"}
                          </p>
                          <p>
                            Ano construcao:{" "}
                            {parcelSummary.building.anoConstrucao ??
                              parcelSummary.building.constructionYear ??
                              "-"}
                          </p>
                        </div>
                      )}

                      {parcelSummary.infrastructure && (
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted">
                            Infraestrutura
                          </p>
                          <p>
                            Agua:{" "}
                            {parcelSummary.infrastructure.agua ??
                            parcelSummary.infrastructure.water
                              ? "Sim"
                              : "Nao"}
                          </p>
                          <p>
                            Esgoto:{" "}
                            {parcelSummary.infrastructure.esgoto ??
                            parcelSummary.infrastructure.sewage
                              ? "Sim"
                              : "Nao"}
                          </p>
                          <p>
                            Energia:{" "}
                            {parcelSummary.infrastructure.energia ??
                            parcelSummary.infrastructure.electricity
                              ? "Sim"
                              : "Nao"}
                          </p>
                          <p>
                            Pavimentacao:{" "}
                            {parcelSummary.infrastructure.pavimentacao ??
                              parcelSummary.infrastructure.pavingType ??
                              "-"}
                          </p>
                          <p>
                            Iluminacao:{" "}
                            {parcelSummary.infrastructure.iluminacao ??
                            parcelSummary.infrastructure.publicLighting
                              ? "Sim"
                              : "Nao"}
                          </p>
                          <p>
                            Coleta:{" "}
                            {parcelSummary.infrastructure.coleta ??
                            parcelSummary.infrastructure.garbageCollection
                              ? "Sim"
                              : "Nao"}
                          </p>
                        </div>
                      )}

                      {parcelSummary.socioeconomic && (
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted">
                            Socioeconomico
                          </p>
                          <p>
                            Faixa renda:{" "}
                            {parcelSummary.socioeconomic.faixaRenda ??
                              parcelSummary.socioeconomic.incomeBracket ??
                              "-"}
                          </p>
                          <p>
                            Moradores:{" "}
                            {parcelSummary.socioeconomic.moradores ??
                              parcelSummary.socioeconomic.residents ??
                              "-"}
                          </p>
                          <p>
                            Vulnerabilidade:{" "}
                            {parcelSummary.socioeconomic.vulnerabilidade ??
                              parcelSummary.socioeconomic.vulnerabilityIndicator ??
                              "-"}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted">PGV</p>
                      <p>
                        Zona: {parcelSummary.parcel.zoneId ? parcelSummary.parcel.zoneId : "-"}
                      </p>
                      <p>
                        Face: {parcelSummary.parcel.faceId ? parcelSummary.parcel.faceId : "-"}
                      </p>
                      <p>
                        Valor venal:{" "}
                        {parcelValuations?.[0]?.totalValue
                          ? `R$ ${parcelValuations[0].totalValue.toFixed(2)}`
                          : "Nao calculado"}
                      </p>
                      {parcelValuations?.[0] && (
                        <>
                          <p>Terreno: R$ {parcelValuations[0].landValue.toFixed(2)}</p>
                          <p>Construcao: R$ {parcelValuations[0].constructionValue.toFixed(2)}</p>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCalculatePgv}
                        disabled={!selectedParcelId}
                      >
                        Calcular PGV
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p>Selecione uma parcela no mapa.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Draw Modal ── */}
      {drawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-md rounded-md border border-outline bg-surface-elevated p-6 shadow-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Novo desenho</p>
              <h3 className="font-display text-lg text-on-surface">Salvar geometria</h3>
              <p className="text-sm text-on-surface-muted">
                Tipo: {pendingFeatureType === "building" ? "Edificacao" : "Terreno"}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Nome</label>
                <Input
                  value={drawForm.name}
                  onChange={(event) =>
                    setDrawForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Descricao</label>
                <Input
                  value={drawForm.description}
                  onChange={(event) =>
                    setDrawForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-muted">Status</label>
                <select
                  className="w-full rounded-sm border border-outline bg-surface-elevated px-3 py-2 text-sm text-on-surface"
                  value={drawForm.status}
                  onChange={(event) =>
                    setDrawForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                  <option value="CONFLITO">CONFLITO</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDraw}>
                Cancelar
              </Button>
              <Button data-testid="maps-save-draw" variant="primary" onClick={handleSaveDraw}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
