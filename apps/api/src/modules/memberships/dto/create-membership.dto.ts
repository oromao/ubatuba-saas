import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../../common/guards/roles.decorator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsIn(['ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'])
  role!: Role;
}

