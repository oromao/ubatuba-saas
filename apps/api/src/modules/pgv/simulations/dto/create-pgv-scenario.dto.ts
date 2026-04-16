import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePgvScenarioDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  faceId?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsString()
  @IsOptional()
  logradouro?: string;

  @IsString()
  @IsOptional()
  uso?: string;

  @IsString()
  @IsOptional()
  padraoConstrutivo?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  proposedLandMultiplier?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  proposedConstructionMultiplier?: number;

  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}
