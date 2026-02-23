import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertParcelInfrastructureDto {
  @IsBoolean()
  @IsOptional()
  water?: boolean;

  @IsBoolean()
  @IsOptional()
  agua?: boolean;

  @IsBoolean()
  @IsOptional()
  sewage?: boolean;

  @IsBoolean()
  @IsOptional()
  esgoto?: boolean;

  @IsBoolean()
  @IsOptional()
  electricity?: boolean;

  @IsBoolean()
  @IsOptional()
  energia?: boolean;

  @IsString()
  @IsOptional()
  pavingType?: string;

  @IsString()
  @IsOptional()
  pavimentacao?: string;

  @IsBoolean()
  @IsOptional()
  publicLighting?: boolean;

  @IsBoolean()
  @IsOptional()
  iluminacao?: boolean;

  @IsBoolean()
  @IsOptional()
  garbageCollection?: boolean;

  @IsBoolean()
  @IsOptional()
  coleta?: boolean;
}
