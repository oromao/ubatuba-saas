export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: unknown[];
};

export type GeoJsonImportPayload = {
  data: GeoJsonFeatureCollection;
  sourceType: string;
  fileName: string;
  upsert: boolean;
};

export type CsvImportPayload = {
  csv: string;
  fileName: string;
  sourceType: string;
};

export function buildGeoJsonImportPayload(
  featureCollection: GeoJsonFeatureCollection,
  fileName: string,
  upsert: boolean,
): GeoJsonImportPayload {
  return { data: featureCollection, sourceType: 'OFFICIAL_IMPORT', fileName, upsert };
}

export function buildCsvImportPayload(csv: string, fileName: string): CsvImportPayload {
  return { csv, fileName, sourceType: 'CSV_ENRICHMENT' };
}