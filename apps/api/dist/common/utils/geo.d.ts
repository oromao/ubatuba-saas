export type PolygonGeometry = {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
};
export type LineGeometry = {
    type: 'LineString';
    coordinates: [number, number][];
};
export type PointGeometry = {
    type: 'Point';
    coordinates: [number, number];
};
export declare function isPolygonGeometry(value: unknown): value is PolygonGeometry;
export declare function isLineGeometry(value: unknown): value is LineGeometry;
export declare function isPointGeometry(value: unknown): value is PointGeometry;
export declare function calculateGeometryArea(geometry: PolygonGeometry): number;
