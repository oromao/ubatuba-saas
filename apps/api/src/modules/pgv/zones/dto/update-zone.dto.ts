import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { PolygonGeometry } from '../../../../common/utils/geo';

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  baseLandValue?: number;

  @IsNumber()
  @IsOptional()
  baseConstructionValue?: number;

  @IsNumber()
  @IsOptional()
  valorBaseTerrenoM2?: number;

  @IsNumber()
  @IsOptional()
  valorBaseConstrucaoM2?: number;

  @IsObject()
  @IsOptional()
  geometry?: PolygonGeometry;
}
