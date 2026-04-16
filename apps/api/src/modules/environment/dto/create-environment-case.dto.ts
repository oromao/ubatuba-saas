import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnvironmentCaseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(['APP', 'PODA', 'ARVORE', 'LAUDO', 'OS', 'LICENCA'])
  category!: 'APP' | 'PODA' | 'ARVORE' | 'LAUDO' | 'OS' | 'LICENCA';

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasks?: string[];
}
