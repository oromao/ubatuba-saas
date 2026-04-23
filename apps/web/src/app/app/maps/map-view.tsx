"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useSearchParams } from "next/navigation";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import { MapToolbar } from "../../../components/maps/MapToolbar";
import { MapLayers } from "../../../components/maps/MapLayers";
import { API_URL, apiFetch } from "../../../lib/api";
import { computeGeometryBounds } from "../../../lib/gis-bounds";
import { useMapStore } from "../../../lib/stores/useMapStore";
import { fetchMapFeaturesGeojson } from "../../../lib/map-features";

type LayerItem = {
  id: string;
  name: string;
  type: "raster" | "vector" | "basemap" | "mvt";
  source: "geoserver" | "api" | "external";
  visible?: boolean;
  opacity?: number;
  order?: number;
  tileUrl?: string;
  dataUrl?: string;
  geometryType?: "line" | "polygon" | "point";
  style?: {
    fillColor?: string;
    lineColor?: string;
    lineWidth?: number;
    labelField?: string;
  };
};

type DrawControlHandle = {
  onAdd: (map: maplibregl.Map) => HTMLElement;
  onRemove: () => void;
  on: (event: "mode-changed" | "feature-deleted", cb: (payload: { feature?: Array<{ geometry?: Geometry; properties?: Record<string, unknown> | null; id?: string }> }) => void) => void;
  getFeatures: () => FeatureCollection;
  activate: () => void;
  deactivate: () => void;
};

const isUnavailableTileUrl = (url?: string) =>
  Boolean(url && (url.includes("localhost:8080") || url.includes("127.0.0.1:8080") || url.includes("geoserver:8080")));

const buildPaint = (layer: LayerItem, type: "circle" | "line" | "fill") => {
  if (type === "circle") {
    return {
      "circle-color": layer.style?.lineColor ?? "#0f766e",
      "circle-radius": 5,
      "circle-opacity": layer.opacity ?? 0.9,
    };
  }

  if (type === "line") {
    return {
      "line-color": layer.style?.lineColor ?? "#0f766e",
      "line-width": layer.style?.lineWidth ?? 2,
      "line-opacity": layer.opacity ?? 0.9,
    };
  }

  return {
    "fill-color": layer.style?.fillColor ?? "#2dd4bf",
    "fill-opacity": layer.opacity ?? 0.15,
    "fill-outline-color": layer.style?.lineColor ?? "#0f766e",
  };
};

export default function DynamicMapViewer() {
  const searchParams = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapConfig = useRef<maplibregl.Map | null>(null);
  const drawControl = useRef<DrawControlHandle | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [geoserverUnavailable, setGeoserverUnavailable] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [highlightedParcel, setHighlightedParcel] = useState<{ sqlu?: string; id?: string } | null>(null);

  const { activeLayers, drawMode, setActiveLayers, addFeature, clearFeatures, features } = useMapStore();

  const orderedLayers = useMemo(
    () => [...layers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [layers],
  );

  const visibleLayers = useMemo(
    () => orderedLayers.filter((layer) => layer.visible !== false),
    [orderedLayers],
  );
  const projectId = typeof window !== "undefined" ? window.localStorage.getItem("projectId") ?? undefined : undefined;
  const highlightedSqlu = searchParams?.get("sqlu") ?? "";
  if (typeof window !== "undefined") {
    const probeWindow = window as Window & {
      __gisScaleProbe?: {
        fitBoundsCalls: number;
        lastBounds: [[number, number], [number, number]] | null;
        builtInParcelFeatures: number;
        builtInParcelSourceReady: boolean;
      };
    };
    probeWindow.__gisScaleProbe ??= { fitBoundsCalls: 0, lastBounds: null, builtInParcelFeatures: 0, builtInParcelSourceReady: false };
  }

  useEffect(() => {
    let mounted = true;
    if (!highlightedSqlu) {
      setHighlightedParcel(null);
      return;
    }

    apiFetch<Array<{ _id?: string; id?: string; sqlu?: string }>>(`/ctm/parcels?sqlu=${encodeURIComponent(highlightedSqlu)}`)
      .then((parcels) => {
        if (!mounted) return;
        const match = parcels?.find((parcel) => parcel.sqlu === highlightedSqlu || parcel._id || parcel.id);
        const parcelId = match?._id || match?.id;
        if (parcelId) {
          setHighlightedParcel({ sqlu: highlightedSqlu, id: parcelId });
        }
      })
      .catch(() => {
        if (mounted) {
          setHighlightedParcel(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [highlightedSqlu]);

  useEffect(() => {
    let mounted = true;
    apiFetch<LayerItem[]>("/layers")
      .then((data) => {
        if (!mounted) return;
        setLayers(data);
        if (useMapStore.getState().activeLayers.length === 0) {
          setActiveLayers(data.filter((layer) => layer.visible !== false).map((layer) => layer.id));
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Falha ao carregar camadas do mapa", error);
      });

    return () => {
      mounted = false;
    };
  }, [setActiveLayers]);

  const fetchJson = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${url} (${response.status})`);
    }
    return response.json();
  };

  useEffect(() => {
    if (!mapContainer.current || mapConfig.current) return;

    try {
      mapConfig.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: [-46.6333, -23.5505], // São Paulo
        zoom: 12,
        pitch: 0,
        bearing: 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao inicializar o mapa";
      setMapError(message);
      // eslint-disable-next-line no-console
      console.error("[MapLibre]", message);
      return;
    }

    mapConfig.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    mapConfig.current.on("load", () => setMapReady(true));
    mapConfig.current.on("error", (e) => {
      // Suppress tile 404 errors (expected for unavailable GeoServer)
      const msg: string = (e as unknown as { error?: { message?: string } })?.error?.message ?? "";
      if (!msg.includes("404") && !msg.includes("Failed to fetch")) {
        // eslint-disable-next-line no-console
        console.warn("[MapLibre]", msg);
      }
    });

    return () => {
      mapConfig.current?.remove();
      mapConfig.current = null;
      setMapReady(false);
      setGeoserverUnavailable(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapConfig.current || drawControl.current) return;

    let active = true;
    import("@watergis/maplibre-gl-terradraw").then(({ MaplibreTerradrawControl }) => {
      if (!active || !mapConfig.current || drawControl.current) return;
      const control = new MaplibreTerradrawControl({
        modes: ["polygon"],
        open: false,
      }) as unknown as DrawControlHandle;
      mapConfig.current.addControl(control, "top-left");
      drawControl.current = control;

      const syncFeatures = () => {
        const drawn = control.getFeatures().features ?? [];
        clearFeatures();
        drawn.forEach((feature) => addFeature({
          type: "Feature",
          id: String(feature.id ?? ""),
          geometry: feature.geometry ? (feature.geometry as Geometry) : null,
          properties: feature.properties ?? {},
        }));
      };

      control.on("mode-changed", syncFeatures);
      control.on("feature-deleted", syncFeatures);
    });

    return () => {
      active = false;
    };
  }, [addFeature, clearFeatures, mapReady]);

  useEffect(() => {
    if (!drawControl.current || !mapConfig.current) return;
    if (drawMode === "polygon") {
      drawControl.current.activate();
      return;
    }
    drawControl.current.deactivate();
  }, [drawMode]);

  useEffect(() => {
    if (!mapReady || !mapConfig.current) return;

    const map = mapConfig.current;
    let hasUnavailableGeoServer = false;

    for (const layer of orderedLayers) {
      const sourceId = `source-${layer.id}`;
      const layerId = `layer-${layer.id}`;
      const active = activeLayers.includes(layer.id) && layer.visible !== false;

      if (!active) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "none");
        }
        continue;
      }

      if (layer.source === "geoserver" && isUnavailableTileUrl(layer.tileUrl)) {
        hasUnavailableGeoServer = true;
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "none");
        }
        continue;
      }

      if (layer.type === "basemap" && layer.tileUrl) {
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
              "raster-opacity": layer.opacity ?? 1,
            },
          });
        } else {
          map.setLayoutProperty(layerId, "visibility", "visible");
        }
        continue;
      }

      if (layer.type === "raster" && layer.tileUrl) {
        if (isUnavailableTileUrl(layer.tileUrl)) {
          hasUnavailableGeoServer = true;
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", "none");
          }
          continue;
        }

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
              "raster-opacity": layer.opacity ?? 0.8,
            },
          });
        } else {
          map.setLayoutProperty(layerId, "visibility", "visible");
        }
        continue;
      }

      if (layer.type === "mvt" && layer.tileUrl) {
        const fullTileUrl = layer.tileUrl.startsWith("http") ? layer.tileUrl : `${API_URL}${layer.tileUrl}`;

        if (isUnavailableTileUrl(fullTileUrl)) {
          hasUnavailableGeoServer = true;
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", "none");
          }
          continue;
        }

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "vector",
            tiles: [fullTileUrl],
          });
        }

        const type = layer.geometryType === "point" ? "circle" : layer.geometryType === "line" ? "line" : "fill";

        if (!map.getLayer(layerId)) {
          try {
            map.addLayer({
              id: layerId,
              type,
              source: sourceId,
              "source-layer": "layer",
              paint: buildPaint(layer, type),
            } as Parameters<typeof map.addLayer>[0]);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`[Mapa] Falha ao adicionar camada MVT ${layer.name}:`, err);
          }
        } else {
          map.setLayoutProperty(layerId, "visibility", "visible");
        }
        continue;
      }

      if (layer.type === "vector" && layer.dataUrl) {
        if (!map.getSource(sourceId)) {
          const isExternalUrl = layer.dataUrl.startsWith("http");
          const fetchPromise = isExternalUrl
            ? fetchJson(layer.dataUrl)
            : apiFetch<unknown>(layer.dataUrl);

          fetchPromise
            .then((geojson) => {
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                  type: "geojson",
                  data: geojson as maplibregl.GeoJSONSourceSpecification["data"],
                });
              }

              const type = layer.geometryType === "point" ? "circle" : layer.geometryType === "line" ? "line" : "fill";

              if (!map.getLayer(layerId)) {
                try {
                  map.addLayer({
                    id: layerId,
                    type,
                    source: sourceId,
                    paint: buildPaint(layer, type),
                  } as Parameters<typeof map.addLayer>[0]);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn(`[Mapa] Falha ao adicionar camada vector ${layer.name}:`, err);
                }
              } else {
                map.setLayoutProperty(layerId, "visibility", "visible");
              }
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error(`Falha ao carregar camada ${layer.name}`, error);
            });
        } else if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", "visible");
        }
      }
    }

    setGeoserverUnavailable(hasUnavailableGeoServer);
  }, [activeLayers, mapReady, orderedLayers]);

  // Always load CTM parcels as a built-in layer from map-features API
  useEffect(() => {
    if (!mapReady || !mapConfig.current) return;
    const map = mapConfig.current;
    const SOURCE = "builtin-parcels";
    const FILL_LAYER = "builtin-parcels-fill";
    const LINE_LAYER = "builtin-parcels-line";
    const LABEL_LAYER = "builtin-parcels-label";

    if (map.getSource(SOURCE)) return; // already loaded

    // Try CTM parcels first (primary source), fall back to map-features
    const loadGeoJson = () =>
      apiFetch<unknown>(`/ctm/parcels/geojson${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`).catch((error) => {
        // CTM parcels may be unavailable in some seeded environments; make the fallback visible.
        // eslint-disable-next-line no-console
        console.warn("[Mapa] CTM parcels indisponiveis, fallback map-features ativado", error);
        return fetchMapFeaturesGeojson("parcel", "", projectId);
      });

    loadGeoJson()
      .then((geojson) => {
        const features = Array.isArray((geojson as { features?: Array<{ id?: string; properties?: Record<string, unknown> | null }> })?.features)
          ? (geojson as { features: Array<{ id?: string; properties?: Record<string, unknown> | null }> }).features
          : [];
        if (highlightedSqlu) {
          const match = features.find((feature) => {
            const props = feature.properties ?? {};
            const sqlu = typeof props.sqlu === "string" ? props.sqlu : "";
            return sqlu === highlightedSqlu;
          });
          const props = match?.properties ?? {};
          const parcelId = typeof props._id === "string" ? props._id : typeof props.id === "string" ? props.id : typeof match?.id === "string" ? match.id : undefined;
          if (match) {
            setHighlightedParcel({ sqlu: highlightedSqlu, id: parcelId });
          }
        } else {
          setHighlightedParcel(null);
        }

        if (!map.getSource(SOURCE)) {
          map.addSource(SOURCE, {
            type: "geojson",
            data: geojson as maplibregl.GeoJSONSourceSpecification["data"],
          });
        }
        if (!map.getLayer(FILL_LAYER)) {
          map.addLayer({
            id: FILL_LAYER,
            type: "fill",
            source: SOURCE,
            paint: {
              "fill-color": [
                "match", ["get", "statusCadastral"],
                "CONFLITO", "#f97316",
                "INATIVO",  "#94a3b8",
                /* default ATIVO */ "#2dd4bf",
              ],
              "fill-opacity": 0.22,
            },
          });
        }
        if (!map.getLayer(LINE_LAYER)) {
          map.addLayer({
            id: LINE_LAYER,
            type: "line",
            source: SOURCE,
            paint: {
              "line-color": "#0f766e",
              "line-width": 1.2,
            },
          });
        }
        if (!map.getLayer(LABEL_LAYER)) {
          map.addLayer({
            id: LABEL_LAYER,
            type: "symbol",
            source: SOURCE,
            minzoom: 15,
            layout: {
              "text-field": ["coalesce", ["get", "sqlu"], ["get", "inscricaoImobiliaria"], ""],
              "text-size": 9,
              "text-anchor": "center",
              "text-allow-overlap": false,
            },
            paint: {
              "text-color": "#0f766e",
              "text-halo-color": "#fff",
              "text-halo-width": 1,
            },
          });
        }

        if (typeof window !== "undefined") {
          const probeWindow = window as Window & {
            __gisScaleProbe?: {
              fitBoundsCalls: number;
              lastBounds: [[number, number], [number, number]] | null;
              builtInParcelFeatures: number;
              builtInParcelSourceReady: boolean;
            };
          };
          if (probeWindow.__gisScaleProbe) {
            const features = Array.isArray((geojson as { features?: unknown[] })?.features)
              ? ((geojson as { features?: unknown[] }).features as unknown[]).length
              : 0;
            probeWindow.__gisScaleProbe.builtInParcelFeatures = features;
            probeWindow.__gisScaleProbe.builtInParcelSourceReady = features > 0;
          }
        }

        // Cursor pointer ao passar sobre lote
        map.on("mouseenter", FILL_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", FILL_LAYER, () => { map.getCanvas().style.cursor = ""; });

        // Popup ao clicar no lote
        map.on("click", FILL_LAYER, (e) => {
          const feat = e.features?.[0];
          if (!feat) return;
          const p = feat.properties ?? {};
          const parcelId = typeof p._id === "string" ? p._id : typeof p.id === "string" ? p.id : "";
          const html = `
            <div style="font-family:sans-serif;line-height:1.5">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong style="font-size:13px">${p.sqlu ?? "—"}</strong>
                <span style="font-size:10px;padding:2px 6px;border-radius:99px;background:${p.sourceType === 'OFFICIAL_IMPORT' ? '#dcfce7' : p.sourceType?.startsWith('DEMO') ? '#fee2e2' : '#f1f5f9'};color:${p.sourceType === 'OFFICIAL_IMPORT' ? '#166534' : p.sourceType?.startsWith('DEMO') ? '#991b1b' : '#475569'}">
                  ${p.sourceType === 'OFFICIAL_IMPORT' ? 'OFICIAL' : p.sourceType === 'DEMO_EXTERNAL' ? 'DEMO EXT' : p.sourceType === 'DEMO' ? 'DEMO' : p.sourceType ?? 'OUTRO'}
                </span>
              </div>
              <span style="color:#555;font-size:11px">${p.mainAddress ?? p.inscricaoImobiliaria ?? ""}</span><br/>
              <hr style="margin:4px 0;border:none;border-top:1px solid #e5e7eb"/>
              <div style="font-size:11px;display:grid;grid-template-cols:auto 1fr;gap:2px 8px">
                <b>Inscrição:</b> <span>${p.inscricaoImobiliaria ?? "—"}</span>
                <b>Status:</b> <span>${p.statusCadastral ?? "—"}</span>
                <b>Área:</b> <span>${p.areaTerreno ? Number(p.areaTerreno).toFixed(0) + " m²" : "—"}</span>
                <b>Zoneamento:</b> <span>${p.zoneamento ?? "—"}</span>
              </div>
              ${parcelId ? `<div style="margin-top:8px"><a href="/app/ctm/parcelas/${parcelId}" style="display:inline-block;padding:6px 10px;border-radius:8px;background:#0f766e;color:#fff;text-decoration:none;font-size:11px">Abrir detalhe</a></div>` : ""}
            </div>`;
          new maplibregl.Popup({ closeButton: true, maxWidth: "280px" })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        });

        // Fit map to parcels extent
        const fc = geojson as { features?: Array<{ geometry?: { type: string; coordinates: any } }> };
        const bounds = computeGeometryBounds(fc.features ?? []);
        if (bounds) {
            const probeWindow = typeof window !== "undefined"
              ? (window as Window & {
                  __gisScaleProbe?: {
                    fitBoundsCalls: number;
                    lastBounds: [[number, number], [number, number]] | null;
                  };
                })
              : null;
            if (probeWindow?.__gisScaleProbe) {
              probeWindow.__gisScaleProbe.fitBoundsCalls += 1;
              probeWindow.__gisScaleProbe.lastBounds = bounds;
            }
            map.fitBounds(bounds, { padding: 60, maxZoom: 18 });
          }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[Mapa] Falha ao carregar parcels built-in", error);
      });
  }, [highlightedSqlu, mapReady, projectId]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e5e7eb] font-sans">
      <MapToolbar />

      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {mapError && (
        <div className="pointer-events-none absolute inset-0 z-[20] flex items-center justify-center bg-slate-950/40 px-6">
          <div className="max-w-lg rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-2xl">
            <div className="text-sm font-semibold text-slate-900">Mapa indisponivel neste ambiente</div>
            <div className="mt-1 text-xs leading-5 text-slate-600">{mapError}</div>
          </div>
        </div>
      )}

      {visibleLayers.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-[10] -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs text-slate-700 shadow-lg backdrop-blur">
          Carregando camadas do tenant...
        </div>
      )}

      {geoserverUnavailable && (
        <div className="pointer-events-none absolute left-4 top-4 z-[10] max-w-sm rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-xs text-amber-900 shadow-lg backdrop-blur">
          Infraestrutura GIS indisponivel nesta sessao. O mapa segue com basemap e camadas nao dependentes de GeoServer.
        </div>
      )}

      {highlightedSqlu && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[10] -translate-x-1/2 rounded-full border border-teal-200 bg-white/95 px-4 py-2 text-xs text-teal-900 shadow-lg backdrop-blur">
          Lote destacado: {highlightedSqlu}
        </div>
      )}

      {highlightedParcel?.id && highlightedParcel.sqlu && (
        <div className="absolute left-4 top-16 z-[11] max-w-xs rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Parcela destacada</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{highlightedParcel.sqlu}</div>
          <a
            href={`/app/ctm/parcelas/${highlightedParcel.id}`}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-sm border border-outline bg-surface-elevated px-3 text-sm font-semibold text-on-surface transition-all duration-fast ease-standard hover:bg-cloud"
          >
            Abrir detalhe
          </a>
        </div>
      )}

      <MapLayers layers={orderedLayers} geoserverUnavailable={geoserverUnavailable} />
      {drawMode && (
        <div className="pointer-events-none absolute right-4 top-20 z-[10] rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-800 shadow">
          Modo desenho ativo: {drawMode}
        </div>
      )}
      {features.length > 0 && (
        <div className="pointer-events-none absolute right-4 bottom-4 z-[10] rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-800 shadow">
          {features.length} geometria(s) desenhada(s)
        </div>
      )}
    </div>
  );
}
