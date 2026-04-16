export type GeometryValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
    calculatedArea?: number;
};
export declare class GeometryService {
    validateGeometry(geometry: any): GeometryValidationResult;
    private calculatePolygonArea;
    checkSimpleOverlap(geom1: any, geom2: any): boolean;
    private getBoundingBox;
}
