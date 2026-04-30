import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RequerenteDto {
  @IsString() nome!: string;
  @IsString() documento!: string;
  @IsString() @IsOptional() endereco?: string;
}

export class UpdateSubdivisionDto {
  @IsString() @IsOptional() motivo?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsString() @IsOptional() status?: string;
  @IsObject() @IsOptional() @ValidateNested() @Type(() => RequerenteDto)
  requerente?: RequerenteDto;
}
