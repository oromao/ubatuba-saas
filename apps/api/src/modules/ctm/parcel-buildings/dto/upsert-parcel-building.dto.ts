import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertParcelBuildingDto {
  @IsString()
  @IsOptional()
  useType?: string;

  @IsString()
  @IsOptional()
  uso?: string;

  @IsString()
  @IsOptional()
  constructionStandard?: string;

  @IsString()
  @IsOptional()
  padraoConstrutivo?: string;

  @IsNumber()
  @IsOptional()
  builtArea?: number;

  @IsNumber()
  @IsOptional()
  areaConstruida?: number;

  @IsNumber()
  @IsOptional()
  floors?: number;

  @IsNumber()
  @IsOptional()
  pavimentos?: number;

  @IsNumber()
  @IsOptional()
  constructionYear?: number;

  @IsNumber()
  @IsOptional()
  anoConstrucao?: number;

  @IsString()
  @IsOptional()
  occupancyType?: string;

  @IsString()
  @IsOptional()
  tipoOcupacao?: string;
}
