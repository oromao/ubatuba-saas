export declare class EnderecoDto {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
}
export declare class ImportGeojsonDto {
    sourceType: 'GEOJSON' | 'SHAPEFILE' | 'OFFICIAL_IMPORT';
    fileName?: string;
    upsert?: boolean;
    data: FeatureCollectionDto;
}
export declare class FeatureCollectionDto {
    type: 'FeatureCollection';
    features: FeatureDto[];
}
export declare class FeatureDto {
    id?: string;
    geometry?: GeometryDto;
    properties?: Record<string, unknown>;
}
export declare class GeometryDto {
    type?: 'Polygon' | 'MultiPolygon';
    coordinates?: unknown;
}
export declare class ImportEnrichmentCsvDto {
    sourceType: 'CSV_ENRICHMENT' | 'IPTU_IMPORT';
    fileName?: string;
    csv: string;
    columnMapping?: ColumnMappingDto;
}
export declare class ColumnMappingDto {
    sqlu?: string;
    inscricao?: string;
    endereco?: string;
    bairro?: string;
    zoneamento?: string;
    areaTerreno?: string;
    areaConstruida?: string;
    valorVenalTerreno?: string;
    valorVenalConstrucao?: string;
    valorVenalTotal?: string;
    iptuLancado?: string;
    iptuPago?: string;
    iptuEmAberto?: string;
    statusIPTU?: string;
    exercicioIPTU?: string;
}
