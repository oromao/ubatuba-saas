declare module 'shapefile' {
  export interface ShapefileFeature {
    type: 'Feature';
    geometry: any;
    properties: Record<string, unknown>;
  }

  export interface ShapefileSource {
    read: () => Promise<{ done: boolean; value?: ShapefileFeature }>;
    close?: () => Promise<void>;
    bbox?: [number, number, number, number];
  }

  export function openShp(
    source: ArrayBuffer | Uint8Array,
  ): Promise<ShapefileSource>;

  export function openDbf(
    source: ArrayBuffer | Uint8Array,
  ): Promise<ShapefileSource>;

  export function open(
    shpSource: ArrayBuffer | Uint8Array,
    dbfSource?: ArrayBuffer | Uint8Array,
  ): Promise<ShapefileSource>;

  export function read(
    shpSource: ArrayBuffer | Uint8Array,
    dbfSource?: ArrayBuffer | Uint8Array,
  ): Promise<{ done: boolean; value?: ShapefileFeature }>;
}
