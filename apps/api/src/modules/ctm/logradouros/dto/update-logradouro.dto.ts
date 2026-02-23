import { IsObject, IsOptional, IsString } from 'class-validator';
import { LineGeometry } from '../../../../common/utils/geo';

export class UpdateLogradouroDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsObject()
  @IsOptional()
  geometry?: LineGeometry;
}
