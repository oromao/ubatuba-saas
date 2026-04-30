export type GeometryValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
    calculatedArea?: number;
};
export declare class GeometryService {
    isValidGeometry(geometry: unknown): boolean;
    calculateArea(geometry: unknown): number;
    validateNoOverlap(geometries: unknown[]): void;
    calculateCentroid(geometry: unknown): {
        type: string;
        coordinates: [number, number];
    } | undefined;
    calculateBbox(geometry: unknown): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    } | undefined;
    validateGeometry(geometry: unknown): GeometryValidationResult;
    private calculatePolygonArea;
    checkSimpleOverlap(geom1: unknown, geom2: unknown): boolean;
    private getBoundingBox;
}
