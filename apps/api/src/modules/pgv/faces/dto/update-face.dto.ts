import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { LineGeometry } from '../../../../common/utils/geo';

export class UpdateFaceDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  logradouroId?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  zonaValorId?: string;

  @IsNumber()
  @IsOptional()
  landValuePerSqm?: number;

  @IsNumber()
  @IsOptional()
  valorTerrenoM2?: number;

  @IsString()
  @IsOptional()
  lado?: string;

  @IsString()
  @IsOptional()
  trecho?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsObject()
  @IsOptional()
  metadados?: {
    lado?: string;
    trecho?: string;
    observacoes?: string;
  };

  @IsObject()
  @IsOptional()
  geometry?: LineGeometry;
}
