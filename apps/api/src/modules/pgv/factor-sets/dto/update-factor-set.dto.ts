import { IsArray, IsOptional, IsString } from 'class-validator';

type FactorItem = {
  tipo: string;
  chave: string;
  valorMultiplicador: number;
};

type ConstructionValueItem = {
  uso: string;
  padraoConstrutivo: string;
  valorM2: number;
};

export class UpdateFactorSetDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsArray()
  @IsOptional()
  fatoresTerreno?: FactorItem[];

  @IsArray()
  @IsOptional()
  fatoresConstrucao?: FactorItem[];

  @IsArray()
  @IsOptional()
  valoresConstrucaoM2?: ConstructionValueItem[];
}
