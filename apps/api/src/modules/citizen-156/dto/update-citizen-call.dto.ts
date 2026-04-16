import { IsIn, IsOptional, IsString } from 'class-validator';
import { CitizenCallStatus } from '../citizen-call.schema';

export class UpdateCitizenCallDto {
  @IsOptional()
  @IsIn(['ABERTO', 'EM_TRIAGEM', 'ENCAMINHADO', 'EM_CAMPO', 'RESOLVIDO', 'CANCELADO'])
  status?: CitizenCallStatus;

  @IsOptional()
  @IsString()
  message?: string;
}
