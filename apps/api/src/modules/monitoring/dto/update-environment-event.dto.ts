import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateEnvironmentEventDto {
  @IsOptional()
  @IsIn(['INGESTAO', 'TRIAGEM', 'FISCALIZACAO', 'EVIDENCIA', 'NOTIFICACAO', 'DESFECHO'])
  stage?: 'INGESTAO' | 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  evidenceKey?: string;

  @IsOptional()
  @IsString()
  sourceAdapter?: string;
}
