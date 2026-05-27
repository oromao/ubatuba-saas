export interface ParsedShapefile {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        geometry: any;
        properties: Record<string, unknown>;
    }>;
}
export declare class ShapefileService {
    parse(buffer: Buffer, originalName?: string): Promise<ParsedShapefile>;
    private parseZip;
    private findInZip;
    private parseShp;
    private parseShpPair;
}
