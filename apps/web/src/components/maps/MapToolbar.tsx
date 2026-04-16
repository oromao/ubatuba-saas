import React from 'react';
import { useMapStore } from '../../lib/stores/useMapStore';
import { PenTool, Trash2 } from 'lucide-react';

export function MapToolbar() {
  const { setDrawMode, clearFeatures, drawMode } = useMapStore();

  return (
    <div
      className="absolute right-4 top-4 z-[10] flex flex-col gap-1.5 rounded-xl border border-outline/60 bg-white/90 p-1.5 shadow-lg backdrop-blur-md sm:top-4"
      role="toolbar"
      aria-label="Ferramentas do mapa"
    >
      <button
        onClick={() => setDrawMode(drawMode === 'polygon' ? null : 'polygon')}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          drawMode === 'polygon'
            ? 'bg-orange-100 text-orange-600 shadow-inner'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
        aria-label="Desenhar área de demarcação"
        aria-pressed={drawMode === 'polygon'}
        title="Desenhar área (polígono)"
      >
        <PenTool size={18} />
      </button>

      <button
        onClick={clearFeatures}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label="Limpar geometrias desenhadas"
        title="Limpar geometrias"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
