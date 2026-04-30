type GeoJsonFeatureCollection = {
    type: 'FeatureCollection';
    features: Array<Record<string, unknown>>;
};
export declare function createVectorTile(geojson: GeoJsonFeatureCollection, z: number, x: number, y: number): Buffer;
export {};
