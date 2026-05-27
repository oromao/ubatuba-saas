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
  group?: string;
  type: "raster" | "vector" | "basemap" | "mvt" | "geojson" | "external";
  source: "geoserver" | "api" | "external" | string;
  visible?: boolean;
  opacity?: number;
  order?: number;
  tileUrl?: string;
  dataUrl?: string;
  url?: string;
  geometryType?: "line" | "polygon" | "point" | "fill" | "circle";
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
    Promise.all([
      import("@mapbox/mapbox-gl-draw"),
      import("@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css" as any)
    ]).then(([{ default: MapboxDraw }]) => {
      if (!active || !mapConfig.current || drawControl.current) return;

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select'
      });

      mapConfig.current.addControl(draw as any, "top-left");
      drawControl.current = draw as any;

      const syncFeatures = () => {
        const drawn = draw.getAll().features ?? [];
        clearFeatures();
        drawn.forEach((feature) => addFeature({
          type: "Feature",
          id: String(feature.id ?? ""),
          geometry: feature.geometry ? (feature.geometry as Geometry) : null,
          properties: feature.properties ?? {},
        }));
      };

      mapConfig.current.on("draw.create", syncFeatures);
      mapConfig.current.on("draw.update", syncFeatures);
      mapConfig.current.on("draw.delete", syncFeatures);
    });

    return () => {
      active = false;
    };
  }, [addFeature, clearFeatures, mapReady]);

  useEffect(() => {
    if (!drawControl.current || !mapConfig.current) return;
    if (drawMode === "polygon") {
      (drawControl.current as any).changeMode('draw_polygon');
      return;
    }
    (drawControl.current as any).changeMode('simple_select');
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

      // geojson type layers (sp-mapas repo, external GeoJSON URLs)
      if ((layer.type === "geojson" || layer.type === "external") && (layer.url || layer.dataUrl)) {
        const sourceUrl = layer.url || layer.dataUrl || "";
        if (layer.source === "geoserver" && isUnavailableTileUrl(sourceUrl)) {
          hasUnavailableGeoServer = true;
          if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", "none");
          continue;
        }
        if (!map.getSource(sourceId)) {
          fetch(sourceUrl)
            .then(r => r.json())
            .then(geojson => {
              if (!map || !mapConfig.current) return;
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, { type: "geojson", data: geojson });
              }
              const geomType = layer.geometryType || "fill";
              const type = geomType === "point" || geomType === "circle" ? "circle" : geomType === "line" ? "line" : "fill";
              if (!map.getLayer(layerId)) {
                try {
                  map.addLayer({
                    id: layerId, type, source: sourceId,
                    paint: type === "fill"
                      ? { "fill-color": layer.style?.fillColor || "#2dd4bf", "fill-opacity": layer.opacity ?? 0.15, "fill-outline-color": layer.style?.lineColor || "#0f766e" }
                      : type === "line"
                        ? { "line-color": layer.style?.lineColor || "#0f766e", "line-width": layer.style?.lineWidth || 2 }
                        : { "circle-color": layer.style?.fillColor || "#0f766e", "circle-radius": 4 },
                  } as any);
                } catch (err) { console.warn("[Mapa] Falha ao adicionar camada", layer.name, err); }
              }
            })
            .catch(err => console.warn("[Mapa] Falha ao carregar GeoJSON externo", layer.name, err.message));
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
              // Verify map still exists before using it (async callback could complete after cleanup)
              if (!map || !mapConfig.current) return;

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

  // Cluster source: clusters at low zoom, individual parcels at high zoom
  useEffect(() => {
    if (!mapReady || !mapConfig.current) return;
    const map = mapConfig.current;
    const CLUSTER_SOURCE = "parcel-clusters";
    const CLUSTER_CIRCLE = "parcel-clusters-circle";
    const CLUSTER_COUNT = "parcel-clusters-count";

    const ZOOM_THRESHOLD = 12;

    const showParcels = (show: boolean) => {
      ["builtin-parcels-fill", "builtin-parcels-line", "builtin-parcels-label"].forEach(l => {
        if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", show ? "visible" : "none");
      });
    };
    const showClusters = (show: boolean) => {
      [CLUSTER_CIRCLE, CLUSTER_COUNT].forEach(l => {
        if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", show ? "visible" : "none");
      });
    };

    const loadClusters = () => {
      const bounds = map.getBounds();
      const zoom = Math.floor(map.getZoom());
      if (zoom >= ZOOM_THRESHOLD) {
        showClusters(false);
        showParcels(true);
        return;
      }
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      apiFetch<unknown>(`/gis/clusters?tenantId=${sessionStorage.getItem("tenantId") || "default"}&projectId=${projectId ? encodeURIComponent(projectId) : ""}&minLng=${bounds.getWest()}&minLat=${bounds.getSouth()}&maxLng=${bounds.getEast()}&maxLat=${bounds.getNorth()}&zoom=${zoom}`)
        .then((data) => {
          if (!map || !mapConfig.current) return;
          if (!map.getSource(CLUSTER_SOURCE)) {
            map.addSource(CLUSTER_SOURCE, { type: "geojson", data: data as maplibregl.GeoJSONSourceSpecification["data"] });
          } else {
            (map.getSource(CLUSTER_SOURCE) as maplibregl.GeoJSONSource).setData(data as maplibregl.GeoJSONSourceSpecification["data"]);
          }

          if (!map.getLayer(CLUSTER_CIRCLE)) {
            map.addLayer({
              id: CLUSTER_CIRCLE,
              type: "circle",
              source: CLUSTER_SOURCE,
              filter: ["has", "count"],
              paint: {
                "circle-color": ["case", ["get", "cluster"], "#0f766e", "#0891b2"],
                "circle-radius": ["case", ["get", "cluster"], ["max", ["*", ["sqrt", ["get", "count"]], 4], 10], 7],
                "circle-opacity": 0.85,
                "circle-stroke-color": "#fff",
                "circle-stroke-width": 3,
              },
            });
          }
          if (!map.getLayer(CLUSTER_COUNT)) {
            map.addLayer({
              id: CLUSTER_COUNT,
              type: "symbol",
              source: CLUSTER_SOURCE,
              filter: ["has", "count"],
              layout: {
                "text-field": ["get", "count"],
                "text-size": 12,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              },
              paint: { "text-color": "#fff" },
            });
          }

          showClusters(true);
          showParcels(false);
        })
        .catch(() => {});
    };

    if (!map.getSource("builtin-parcels")) {
      const loadParcels = () => {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        return apiFetch<unknown>(`/ctm/parcels/geojson?bbox=${bbox}${projectId ? `&projectId=${encodeURIComponent(projectId)}` : ""}`)
          .catch(() => fetchMapFeaturesGeojson("parcel", "", projectId));
      };

      loadParcels().then((geojson) => {
        if (!map || !mapConfig.current) return;
        map.addSource("builtin-parcels", { type: "geojson", data: geojson as maplibregl.GeoJSONSourceSpecification["data"] });
        map.addLayer({
          id: "builtin-parcels-fill", type: "fill", source: "builtin-parcels",
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "statusIPTU"], "INADIMPLENTE"], "#fca5a5",
              ["==", ["get", "statusIPTU"], "EM_ABERTO"], "#fde68a",
              ["==", ["get", "statusCadastral"], "CONFLITO"], "#f97316",
              ["==", ["get", "statusCadastral"], "INATIVO"], "#e2e8f0",
              ["==", ["get", "situacaoOcupacao"], "VAZIO"], "#fef3c7",
              ["==", ["get", "situacaoOcupacao"], "EM_CONSTRUCAO"], "#dbeafe",
              "#dcfce7"
            ],
            "fill-opacity": 0.3,
          }
        });
        map.addLayer({
          id: "builtin-parcels-line", type: "line", source: "builtin-parcels",
          paint: { "line-color": "#475569", "line-width": 1.5, "line-opacity": 0.7 }
        });
        map.addLayer({
          id: "builtin-parcels-label", type: "symbol", source: "builtin-parcels",
          minzoom: 15,
          layout: {
            "text-field": ["coalesce", ["get", "sqlu"], ["get", "inscricaoImobiliaria"], ""],
            "text-size": 9, "text-anchor": "center", "text-allow-overlap": false
          },
          paint: { "text-color": "#1e293b", "text-halo-color": "#fff", "text-halo-width": 2 }
        });
        map.on("mouseenter", "builtin-parcels-fill", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "builtin-parcels-fill", () => { map.getCanvas().style.cursor = ""; });
        map.on("click", "builtin-parcels-fill", (e) => {
          const feat = e.features?.[0];
          if (!feat) return;
          const p = feat.properties ?? {};
          const parcelId = typeof p.parcelId === "string" ? p.parcelId : typeof p._id === "string" ? p._id : typeof p.id === "string" ? p.id : "";
          const sqlu = p.sqlu || p.inscricaoImobiliaria || "—";
          const address = p.mainAddress || p.address || p.inscricaoImobiliaria || "";
          const area = p.areaTerreno ? Number(p.areaTerreno).toFixed(0) + " m²" : "—";
          const status = p.workflowStatus || p.statusCadastral || p.status || "—";
          new maplibregl.Popup({ closeButton: true, maxWidth: "300px" })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:sans-serif;line-height:1.5;min-width:200px"><div style="display:flex;justify-content:space-between;align-items:center"><strong style="font-size:14px">${sqlu}</strong><span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#dcfce7;color:#166534">${status}</span></div><div style="color:#555;font-size:11px;margin-top:4px">${address}</div><hr style="margin:6px 0;border:none;border-top:1px solid #e5e7eb"/><div style="font-size:12px;display:grid;grid-template-columns:auto 1fr;gap:2px 8px"><b>Area:</b><span>${area}</span></div>${parcelId ? `<div style="margin-top:8px"><a href="/app/ctm/parcelas/${parcelId}" style="display:block;text-align:center;padding:8px;border-radius:8px;background:#0f766e;color:#fff;text-decoration:none;font-size:12px">Abrir detalhe completo</a></div>` : ""}</div>`)
            .addTo(map);
        });

        const fc = geojson as { features?: Array<{ geometry?: { type: string; coordinates: any } }> };
        const bounds = computeGeometryBounds(fc.features ?? []);
        if (bounds) map.fitBounds(bounds, { padding: 60, maxZoom: 18 });
      }).catch(() => {});
    }

    // Cluster click: zoom in
    map.on("click", CLUSTER_CIRCLE, (e) => {
      const feat = e.features?.[0];
      if (!feat) return;
      const props = feat.properties ?? {};
      if (props.cluster) {
        const expansionZoom = props.expansion_zoom ?? map.getZoom() + 2;
        const geom = feat.geometry as any;
        const center = geom?.coordinates || [0, 0];
        map.flyTo({ center, zoom: expansionZoom });
      }
    });

    let moveTimeout: ReturnType<typeof setTimeout>;
    const onMove = () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(loadClusters, 300);
    };
    map.on("moveend", onMove);

    loadClusters();

    return () => {
      map.off("moveend", onMove);
      map.off("click", CLUSTER_CIRCLE, undefined as any);
    };
  }, [mapReady, projectId]);

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
      <VectorizedParcelForm
        features={features}
        drawControl={drawControl.current}
        projectId={projectId}
        clearFeatures={clearFeatures}
        setDrawMode={setDrawMode}
      />
    </div>
  );
}

type VectorizedFormProps = {
  features: Array<any>;
  drawControl: any;
  projectId?: string;
  clearFeatures: () => void;
  setDrawMode: (mode: string | null) => void;
};

function VectorizedParcelForm({ features, drawControl, projectId, clearFeatures, setDrawMode }: VectorizedFormProps) {
  const [sqlu, setSqlu] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (features.length === 0) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlu.trim()) {
      setMsg({ type: "error", text: "O código SQLU é obrigatório." });
      return;
    }
    const geom = features[0]?.geometry;
    if (!geom) {
      setMsg({ type: "error", text: "Nenhuma geometria válida encontrada." });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const response = await apiFetch<any>("/ctm/parcels", {
        method: "POST",
        body: JSON.stringify({
          sqlu: sqlu.trim(),
          inscricaoImobiliaria: sqlu.trim().replace(/([0-9]{3})([0-9]{3})([0-9]{4})([0-9]{2})/, "$1.$2.$3.$4"),
          mainAddress: address.trim() || "Nova Área Vetorizada",
          geometry: geom,
          projectId,
          status: "ATIVO",
          statusCadastral: "ATIVO",
          workflowStatus: "APROVADA"
        })
      });

      setMsg({ type: "success", text: `Lote ${response.sqlu} vetorizado com sucesso!` });
      setTimeout(() => {
        clearFeatures();
        if (drawControl) {
          drawControl.deleteAll();
        }
        setDrawMode(null);
        setSqlu("");
        setAddress("");
        setMsg(null);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Erro ao salvar a parcela vetorizada." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-[12] max-w-sm w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl backdrop-blur-md">
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-600">CTM - Nova Vetorização</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">Salvar Área Desenhada</div>
      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase">Código SQLU (Lote/Quadra)*</label>
          <input
            type="text"
            required
            placeholder="Ex: 001002000304"
            value={sqlu}
            onChange={(e) => setSqlu(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase">Endereço Principal</label>
          <input
            type="text"
            placeholder="Ex: Av. Iperoig, 150"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
          />
        </div>

        {msg && (
          <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
            msg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}>
            {msg.text}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-orange-600 px-3 text-xs font-semibold text-white transition-all hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar no CTM"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              clearFeatures();
              if (drawControl) drawControl.deleteAll();
            }}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
