import { IsOptional, IsString, IsNumber, IsArray, IsObject, IsBoolean } from 'class-validator';

export class UpdateMunicipalConfigDto {
  @IsOptional() @IsString() brasao?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() cnpjMunicipio?: string;
  @IsOptional() @IsString() ibgeCode?: string;
  @IsOptional() @IsString() uf?: string;

  @IsOptional() @IsObject()
  endereco?: Record<string, string>;

  @IsOptional() @IsObject()
  aliquotasPadrao?: Record<string, number>;

  @IsOptional() @IsArray()
  leis?: Array<Record<string, any>>;

  @IsOptional() @IsObject()
  modulosHabilitados?: Record<string, boolean>;

  @IsOptional() @IsObject()
  pgvPadrao?: Record<string, number>;

  @IsOptional() @IsObject()
  configuracaoRegional?: Record<string, string>;
}
