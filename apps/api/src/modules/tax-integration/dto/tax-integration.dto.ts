import { IsBoolean, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { TaxConnectorMode } from '../tax-connector.schema';

export class CreateTaxConnectorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(['REST_JSON', 'CSV_UPLOAD', 'SFTP'])
  mode!: TaxConnectorMode;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateTaxConnectorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['REST_JSON', 'CSV_UPLOAD', 'SFTP'])
  mode?: TaxConnectorMode;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RunTaxSyncDto {
  @IsOptional()
  @IsString()
  csvContent?: string;
}

