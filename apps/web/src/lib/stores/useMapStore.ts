import { create } from 'zustand';
import type { Feature, Geometry } from 'geojson';

interface MapState {
  activeLayers: string[];
  drawMode: string | null;
  features: Feature<Geometry | null>[];
  
  // Ações
  toggleLayer: (layerId: string) => void;
  setActiveLayers: (layerIds: string[]) => void;
  setDrawMode: (mode: string | null) => void;
  addFeature: (feature: Feature<Geometry | null>) => void;
  clearFeatures: () => void;
}

/**
 * Estado Global (Zustand) isolado para a visualização de mapas (Leaflet / MapLibre).
 * Remove a necessidade de "prop drilling" profundo no `map-view.tsx` 
 * e mitiga severos impactos de re-renderização (First Contentful Paint).
 */
export const useMapStore = create<MapState>((set) => ({
  activeLayers: [],
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

  setActiveLayers: (layerIds) => set({ activeLayers: layerIds }),

  setDrawMode: (mode) => set({ drawMode: mode }),
  
  addFeature: (feature) =>
    set((state) => ({ features: [...state.features, feature] })),
    
  clearFeatures: () => set({ features: [] }),
}));
