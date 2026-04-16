import { IsIn, IsOptional, IsString } from 'class-validator';
import type { PublicWorkStatus } from '../public-work.schema';

export class UpdatePublicWorkDto {
  @IsOptional()
  @IsIn(['PLANEJADA', 'CONTRATADA', 'EM_EXECUCAO', 'PARALISADA', 'CONCLUIDA', 'CANCELADA'])
  status?: PublicWorkStatus;

  @IsOptional()
  @IsString()
  contractor?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
