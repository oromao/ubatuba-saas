import { IsIn, IsOptional, IsString } from 'class-validator';
import type { CemeteryPlotStatus } from '../cemetery.schema';

export class UpdateCemeteryPlotDto {
  @IsOptional()
  @IsIn(['LIVRE', 'RESERVADO', 'OCUPADO', 'EM_MANUTENCAO'])
  status?: CemeteryPlotStatus;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  occupantName?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
