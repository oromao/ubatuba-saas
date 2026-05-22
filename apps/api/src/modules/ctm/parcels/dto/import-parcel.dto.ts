import { IsString, IsOptional, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class EnderecoDto {
  @IsOptional()
  @IsString()
  logradouro?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;
}

export class FeatureCollectionDto {
  @IsString()
  type!: 'FeatureCollection';

  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features!: FeatureDto[];
}

export class GeometryDto {
  @IsOptional()
  @IsString()
  type?: 'Polygon' | 'MultiPolygon';

  @IsOptional()
  @IsArray()
  coordinates?: unknown;
}

export class FeatureDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

  @IsOptional()
  @IsArray()
  properties?: Record<string, unknown>;
}

export class ImportGeojsonDto {
  @IsString()
  sourceType!: 'GEOJSON' | 'SHAPEFILE' | 'OFFICIAL_IMPORT';

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsBoolean()
  upsert?: boolean;

  @ValidateNested()
  @Type(() => FeatureCollectionDto)
  data!: FeatureCollectionDto;
}

export class ColumnMappingDto {
  @IsOptional()
  @IsString()
  sqlu?: string;

  @IsOptional()
  @IsString()
  inscricao?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  zoneamento?: string;

  @IsOptional()
  @IsString()
  areaTerreno?: string;

  @IsOptional()
  @IsString()
  areaConstruida?: string;

  @IsOptional()
  @IsString()
  valorVenalTerreno?: string;

  @IsOptional()
  @IsString()
  valorVenalConstrucao?: string;

  @IsOptional()
  @IsString()
  valorVenalTotal?: string;

  @IsOptional()
  @IsString()
  iptuLancado?: string;

  @IsOptional()
  @IsString()
  iptuPago?: string;

  @IsOptional()
  @IsString()
  iptuEmAberto?: string;

  @IsOptional()
  @IsString()
  statusIPTU?: string;

  @IsOptional()
  @IsString()
  exercicioIPTU?: string;
}

export class ImportEnrichmentCsvDto {
  @IsString()
  sourceType!: 'CSV_ENRICHMENT' | 'IPTU_IMPORT';

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsString()
  csv!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColumnMappingDto)
  columnMapping?: ColumnMappingDto;
}
