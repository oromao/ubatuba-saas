declare module '@mapbox/vector-tile' {
  export class VectorTile {
    constructor(data: Uint8Array, end?: number, extent?: number);
    layers: { [name: string]: VectorTileLayer };
    static fromGeoJSON(name: string, geojson: any, options?: any): Uint8Array;
  }

  export class VectorTileLayer {
    name: string;
    version: number;
    extent: number;
    length: number;
    features: VectorTileFeature[];
  }

  export class VectorTileFeature {
    constructor(options: {
      id?: number;
      properties?: { [key: string]: any };
      type?: number;
      geometry?: number[][];
    });
    id: number;
    properties: { [key: string]: any };
    type: number;
    geometry: number[][];
    extent: number;
    loadGeometry(): number[][];
  }
}
