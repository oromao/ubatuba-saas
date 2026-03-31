import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy loading the entire Map View client-side to prevent SSR blockage
// and reduce main bundle size (MapLibre e Turf.js são pesados)
const DynamicMapViewer = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px] text-muted-foreground bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
      <p className="text-sm">Inicializando Motor GIS/Web...</p>
      <p className="text-xs text-slate-400 mt-2">Carregando MapLibreGL remotamente sob demanda.</p>
    </div>
  ),
});

export default function MapsPageLazyRoute() {
  return <DynamicMapViewer />;
}
