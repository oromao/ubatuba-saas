import React, { useEffect, useRef } from 'react';
import { MapToolbar } from '../../../components/maps/MapToolbar';
import { MapLayers } from '../../../components/maps/MapLayers';
import { useMapStore } from '../../../lib/stores/useMapStore';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function DynamicMapViewer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapConfig = useRef<maplibregl.Map | null>(null);
  
  // Inscrito no estado gerido pelo Zustand
  const { activeLayers, drawMode } = useMapStore();

  useEffect(() => {
    if (!mapContainer.current || mapConfig.current) return;
    
    // 1. Core Engine Setup (Isolado e limpo)
    mapConfig.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-45.0711, -23.4339], // Coordenadas de Ubatuba-SP
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    mapConfig.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    
    return () => {
      mapConfig.current?.remove();
      mapConfig.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#e5e7eb] font-sans">
      {/* Action Toolbar UI (Zustand Injected) */}
      <MapToolbar />
      
      {/* Canvas Principal */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Side Controllers (Zustand Injected) */}
      <MapLayers />
    </div>
  );
}
