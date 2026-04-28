export declare const CRS_WGS84 = "EPSG:4326";
export declare const CRS_SIRGAS2000_UTM_23S = "EPSG:31983";
export declare const CRS_SIRGAS2000_UTM_24S = "EPSG:31984";
export declare const CRS_SAD69_UTM_23S = "EPSG:29193";
export declare const CRS_SAD69_UTM_24S = "EPSG:29194";
export declare const CRS_WEB_MERCATOR = "EPSG:3857";
export declare const SIRGAS_2000_UTM_ZONES: string[];
export declare const SAD69_UTM_ZONES: string[];
export interface CrsDetectionResult {
    detectedCrs: string | null;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
}
export interface CoordinateConversionResult {
    success: boolean;
    converted?: number[];
    error?: string;
}
export declare function detectCrsFromCoordinates(coordinates: number[]): CrsDetectionResult;
export declare function convertCoordinate(coordinate: number[], fromCrs: string, toCrs?: string): CoordinateConversionResult;
export declare function convertGeometryCoordinates(geometry: GeoJSON.Geometry, fromCrs: string, toCrs?: string): GeoJSON.Geometry | null;
export declare function isWgs84Coordinate(coord: number[]): boolean;
export declare function isUtmCoordinate(coord: number[]): boolean;
export declare function suggestCrsForBrazil(coordinates: number[]): string;
