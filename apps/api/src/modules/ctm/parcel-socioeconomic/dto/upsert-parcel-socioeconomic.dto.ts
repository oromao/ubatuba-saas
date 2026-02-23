import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertParcelSocioeconomicDto {
  @IsString()
  @IsOptional()
  incomeBracket?: string;

  @IsString()
  @IsOptional()
  faixaRenda?: string;

  @IsNumber()
  @IsOptional()
  residents?: number;

  @IsNumber()
  @IsOptional()
  moradores?: number;

  @IsString()
  @IsOptional()
  vulnerabilityIndicator?: string;

  @IsString()
  @IsOptional()
  vulnerabilidade?: string;
}
