export declare class ImportLayerDto {
    name: string;
    group: string;
    description?: string;
    sourceUrl?: string;
    sourceType?: 'external' | 'geojson_url';
    geometryType?: 'polygon' | 'line' | 'point' | 'mixed';
    style?: LayerStyleDto;
    opacity?: number;
    visible?: boolean;
    order?: number;
}
export declare class LayerStyleDto {
    fillColor?: string;
    fillOpacity?: number;
    lineColor?: string;
    lineWidth?: number;
    labelField?: string;
    labelColor?: string;
}
export declare class BulkImportLayersDto {
    layers: ImportLayerDto[];
}
