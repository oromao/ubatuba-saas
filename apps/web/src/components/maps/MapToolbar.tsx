import React from 'react';
import { useMapStore } from '../../lib/stores/useMapStore';
import { PenTool, Trash2 } from 'lucide-react';

export function MapToolbar() {
  const { setDrawMode, clearFeatures, drawMode } = useMapStore();

  return (
    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200/50 z-[10] flex flex-col gap-2">
      <button 
        onClick={() => setDrawMode(drawMode === 'polygon' ? null : 'polygon')}
        className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${drawMode === 'polygon' ? 'bg-orange-100 text-orange-600 shadow-inner' : 'text-slate-600'}`}
        title="Desenhar Área (Polígono de Demarcação)"
      >
        <PenTool size={20} />
      </button>

      <button 
        onClick={clearFeatures}
        className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
        title="Limpar Geometrias do Canvas"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
