export type GeometryValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
    calculatedArea?: number;
};
export declare class GeometryService {
    validateGeometry(geometry: unknown): GeometryValidationResult;
    private calculatePolygonArea;
    checkSimpleOverlap(geom1: unknown, geom2: unknown): boolean;
    private getBoundingBox;
}
