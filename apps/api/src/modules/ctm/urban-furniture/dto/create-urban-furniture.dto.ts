import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUrbanFurnitureDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  estadoConservacao?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;
}
