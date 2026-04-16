import { IsIn, IsOptional, IsString } from 'class-validator';
import { EnvironmentCaseStatus } from '../environment-case.schema';

export class UpdateEnvironmentCaseDto {
  @IsOptional()
  @IsIn(['ABERTO', 'EM_ANALISE', 'EM_CAMPO', 'EVIDENCIA', 'LAUDO', 'OS', 'ENCERRADO', 'INDEFERIDO'])
  status?: EnvironmentCaseStatus;

  @IsOptional()
  @IsString()
  message?: string;
}
