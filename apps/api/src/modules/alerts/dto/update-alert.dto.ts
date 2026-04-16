import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAlertDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  stage?: 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceKeys?: string[];

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
