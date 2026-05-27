export interface BboxCoords {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
}
export type BboxString = string;
export declare function parseBbox(value: string | number[]): BboxCoords;
export declare function buildGeoIntersectsPolygon(minLng: number, minLat: number, maxLng: number, maxLat: number): {
    $geoIntersects: {
        $geometry: {
            type: string;
            coordinates: number[][][];
        };
    };
};
