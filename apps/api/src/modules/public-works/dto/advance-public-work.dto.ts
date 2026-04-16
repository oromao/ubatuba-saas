import { IsIn, IsOptional, IsString } from 'class-validator';
import type { PublicWorkStage } from '../public-work.schema';

export class AdvancePublicWorkDto {
  @IsIn(['CADASTRO', 'PROJETO', 'EXECUCAO', 'FISCALIZACAO', 'MEDICAO', 'ENTREGA'])
  stage!: PublicWorkStage;

  @IsOptional()
  @IsString()
  message?: string;
}
