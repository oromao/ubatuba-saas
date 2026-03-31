import React from 'react';
import { useMapStore } from '../../lib/stores/useMapStore';
import { Layers } from 'lucide-react';

const AVAILABLE_LAYERS = [
  { id: 'layer-lotes', name: 'Lotes (CTM)', color: 'bg-orange-500' },
  { id: 'layer-bairros', name: 'Bairros Oficiais', color: 'bg-blue-500' },
  { id: 'layer-vias', name: 'Vias e Eixos', color: 'bg-slate-500' },
  { id: 'layer-reurb', name: 'Núcleos REURB-S', color: 'bg-emerald-500' }
];

export function MapLayers() {
  const { activeLayers, toggleLayer } = useMapStore();

  return (
    <div className="absolute bottom-6 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200/50 z-[10] w-64">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <Layers size={18} className="text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-800">Camadas GIS</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {AVAILABLE_LAYERS.map(layer => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <label key={layer.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors 
                ${isActive ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isActive}
                onChange={() => toggleLayer(layer.id)} 
              />
              <span className={`text-sm select-none ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {layer.name}
              </span>
              <div className={`ml-auto w-2 h-2 rounded-full ${layer.color} opacity-80`} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
