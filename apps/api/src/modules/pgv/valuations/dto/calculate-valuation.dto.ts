import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CalculateValuationDto {
  @IsString()
  parcelId!: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  versionId?: string;

  @IsString()
  @IsOptional()
  versao?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  faceId?: string;

  @IsString()
  @IsOptional()
  landFactorId?: string;

  @IsString()
  @IsOptional()
  constructionFactorId?: string;

  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}
