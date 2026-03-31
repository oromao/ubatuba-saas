import { create } from 'zustand';

interface MapState {
  activeLayers: string[];
  drawMode: string | null;
  features: any[]; // Coleção de features GeoJSON desenhadas pelo usuário (Mapbox Draw)
  
  // Ações
  toggleLayer: (layerId: string) => void;
  setDrawMode: (mode: string | null) => void;
  addFeature: (feature: any) => void;
  clearFeatures: () => void;
}

/**
 * Estado Global (Zustand) isolado para a visualização de mapas (Leaflet / MapLibre).
 * Remove a necessidade de "prop drilling" profundo no `map-view.tsx` 
 * e mitiga severos impactos de re-renderização (First Contentful Paint).
 */
export const useMapStore = create<MapState>((set) => ({
  activeLayers: ['layer-lotes', 'layer-bairros'],
  drawMode: null,
  features: [],
  
  toggleLayer: (layerId) =>
    set((state) => {
      const exists = state.activeLayers.includes(layerId);
      return {
        activeLayers: exists
          ? state.activeLayers.filter((id) => id !== layerId)
          : [...state.activeLayers, layerId],
      };
    }),
    
  setDrawMode: (mode) => set({ drawMode: mode }),
  
  addFeature: (feature) =>
    set((state) => ({ features: [...state.features, feature] })),
    
  clearFeatures: () => set({ features: [] }),
}));
