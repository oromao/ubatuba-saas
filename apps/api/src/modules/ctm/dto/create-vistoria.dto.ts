import { IsNotEmpty, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateVistoriaDto {
  @IsNotEmpty()
  @IsString()
  parcelId!: string;

  @IsNotEmpty()
  @IsString()
  tipo!: string;

  @IsNotEmpty()
  @IsDateString()
  data!: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];
}
