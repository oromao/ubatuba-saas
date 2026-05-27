import * as GeoJSON from 'geojson';
export interface ShapefileImportResult {
    featureCollection: GeoJSON.FeatureCollection;
    warnings: string[];
    detectedCrs: string | null;
    totalFeatures: number;
}
export declare class ShapefileImportService {
    private readonly logger;
    private detectCrsFromPrj;
    private reprojectGeometry;
    parseShpZip(zipBuffer: Buffer): Promise<ShapefileImportResult>;
    private extractFirstCoordinate;
}
