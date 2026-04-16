import { IsIn, IsOptional, IsString } from 'class-validator';
import { PermitBusinessStatus } from '../permit-business.schema';

export class UpdatePermitBusinessDto {
  @IsOptional()
  @IsIn(['ABERTO', 'EM_ANALISE', 'EXIGENCIA', 'EM_TAXA', 'EMITIDO', 'ENCERRADO', 'INDEFERIDO'])
  status?: PermitBusinessStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['ABERTURA', 'ANALISE_TECNICA', 'EXIGENCIAS', 'PARECER', 'TAXAS', 'ASSINATURA', 'EMISSAO', 'ENCERRAMENTO', 'INDEFERIDO'])
  stage?: string;
}
