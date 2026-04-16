import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermitBusinessDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  activityDescription!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
