import { IsIn, IsOptional, IsString } from 'class-validator';
import { PermitWorkStatus } from '../permit-work.schema';

export class UpdatePermitWorkDto {
  @IsOptional()
  @IsIn(['ABERTO', 'EM_ANALISE', 'EXIGENCIA', 'EM_TAXA', 'EM_ASSINATURA', 'EMISSO', 'CONCLUIDO', 'INDEFERIDO'])
  status?: PermitWorkStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['ABERTURA', 'ANALISE_TECNICA', 'EXIGENCIAS', 'PARECER', 'TAXAS', 'ASSINATURA', 'EMISSAO', 'ENCERRAMENTO', 'INDEFERIDO'])
  stage?: string;
}
