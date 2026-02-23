declare module "@mapbox/mapbox-gl-draw" {
  import type { IControl, Map as MaplibreMap } from "maplibre-gl";

  interface MapboxDraw extends IControl {
    changeMode(mode: string, options?: any): void;
    getAll(): any;
    delete(ids: string | string[]): void;
    deleteAll(): void;
    set(featureCollection: any): string[];
    add(geojson: any): string[];
    get(id: string): any;
    getSelectedIds(): string[];
    getMode(): string;
    trash(): void;
    combineFeatures(): void;
    uncombineFeatures(): void;
    getSelectedPoints(): any;
    [key: string]: any;
  }

  interface MapboxDrawConstructor {
    new (options?: any): MapboxDraw;
    modes: Record<string, any>;
  }

  const MapboxDraw: MapboxDrawConstructor;
  export default MapboxDraw;
}
