import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportLayerDto {
  @IsString()
  name!: string;

  @IsString()
  group!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  sourceType?: 'external' | 'geojson_url';

  @IsString()
  @IsOptional()
  geometryType?: 'polygon' | 'line' | 'point' | 'mixed';

  @ValidateNested()
  @Type(() => LayerStyleDto)
  @IsOptional()
  style?: LayerStyleDto;

  @IsNumber()
  @IsOptional()
  opacity?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class LayerStyleDto {
  @IsString()
  @IsOptional()
  fillColor?: string;

  @IsString()
  @IsOptional()
  fillOpacity?: number;

  @IsString()
  @IsOptional()
  lineColor?: string;

  @IsNumber()
  @IsOptional()
  lineWidth?: number;

  @IsString()
  @IsOptional()
  labelField?: string;

  @IsString()
  @IsOptional()
  labelColor?: string;
}

export class BulkImportLayersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportLayerDto)
  layers!: ImportLayerDto[];
}
