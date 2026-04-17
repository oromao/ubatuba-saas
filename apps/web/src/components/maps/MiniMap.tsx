"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MiniMapProps {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  className?: string;
  interactive?: boolean;
  geojsonUrl?: string;
  onFeatureClick?: (properties: any) => void;
}

export default function MiniMap({
  center = [-46.6333, -23.5505], // São Paulo-SP by default
  zoom = 13,
  pitch = 0,
  bearing = 0,
  className = "absolute inset-0 w-full h-full",
  interactive = false,
  geojsonUrl,
  onFeatureClick,
}: MiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapConfig = useRef<maplibregl.Map | null>(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapConfig.current) return;

    try {
      mapConfig.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center,
        zoom,
        pitch,
        bearing,
        interactive,
        attributionControl: false,
      });
    } catch {
      setMapUnavailable(true);
      return;
    }

    if (interactive) {
      mapConfig.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    }

    mapConfig.current.on('load', () => {
      const map = mapConfig.current;
      if (!map) return;

      if (geojsonUrl) {
        map.addSource('dynamic-geojson', {
          type: 'geojson',
          data: geojsonUrl,
        });

        map.addLayer({
          id: 'geojson-fill',
          type: 'fill',
          source: 'dynamic-geojson',
          paint: {
            'fill-color': '#0f766e',
            'fill-opacity': 0.4,
          },
        });

        map.addLayer({
          id: 'geojson-line',
          type: 'line',
          source: 'dynamic-geojson',
          paint: {
            'line-color': '#115e59',
            'line-width': 2,
          },
        });

        if (onFeatureClick) {
          map.on('click', 'geojson-fill', (e) => {
            if (e.features && e.features.length > 0) {
              onFeatureClick(e.features[0].properties);
            }
          });
          map.on('mouseenter', 'geojson-fill', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'geojson-fill', () => {
            map.getCanvas().style.cursor = '';
          });
        }
      }
    });

    return () => {
      mapConfig.current?.remove();
      mapConfig.current = null;
    };
  }, [bearing, center, interactive, pitch, zoom, geojsonUrl, onFeatureClick]);

  if (mapUnavailable) {
    return (
      <div className={className} role="status" aria-live="polite">
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-600">
          Mapa indisponivel neste ambiente.
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
}
