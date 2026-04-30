import { IsString, IsOptional, IsArray, ArrayMinSize, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class RequerenteDto {
  @IsString() nome!: string;
  @IsString() documento!: string;
  @IsString() @IsOptional() endereco?: string;
}

class ChildDefinitionDto {
  @IsString() sqlu!: string;
  @IsObject() geometry!: any;
  @IsString() @IsOptional() mainAddress?: string;
  @IsString() @IsOptional() inscricaoImobiliaria?: string;
}

export class CreateSubdivisionDto {
  @IsString() parentParcelId!: string;
  @IsString() @IsOptional() tipo?: string;
  @IsString() @IsOptional() numeroProcesso?: string;
  @IsString() @IsOptional() motivo?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsObject() @IsOptional() @ValidateNested() @Type(() => RequerenteDto)
  requerente?: RequerenteDto;
  @IsArray() @ArrayMinSize(2) @ValidateNested({ each: true }) @Type(() => ChildDefinitionDto)
  childDefinitions!: ChildDefinitionDto[];
}
