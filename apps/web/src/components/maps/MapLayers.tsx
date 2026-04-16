import React from "react";
import { Layers } from "lucide-react";
import { useMapStore } from "../../lib/stores/useMapStore";

type LayerSummary = {
  id: string;
  name: string;
  type: string;
  source: string;
  visible?: boolean;
};

type MapLayersProps = {
  layers: LayerSummary[];
  geoserverUnavailable?: boolean;
};

export function MapLayers({ layers, geoserverUnavailable = false }: MapLayersProps) {
  const { activeLayers, toggleLayer } = useMapStore();

  return (
    <div className="absolute bottom-6 left-4 z-[10] w-72 rounded-xl border border-slate-200/50 bg-white/90 p-4 shadow-lg backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Layers size={18} className="text-slate-600" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">Camadas GIS</h3>
          {geoserverUnavailable && (
            <p className="text-[11px] text-amber-700">GeoServer indisponivel nesta sessao; camadas territoriais ocultas.</p>
          )}
        </div>
      </div>

      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          const isHiddenByDefault = layer.visible === false;

          return (
            <label key={layer.id} className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors ${
                  isActive ? "border-blue-600 bg-blue-600" : "border-slate-300 group-hover:border-blue-400"
                }`}
              >
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={isActive}
                onChange={() => toggleLayer(layer.id)}
              />
              <span className={`text-sm select-none ${isActive ? "font-medium text-slate-900" : "text-slate-600"}`}>
                {layer.name}
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                {isHiddenByDefault ? "oculta" : layer.source}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
