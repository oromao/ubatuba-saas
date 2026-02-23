import { IsBoolean, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLetterTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  html!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateLetterTemplateDto {
  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PreviewTemplateDto {
  @IsString()
  @IsNotEmpty()
  html!: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number>;
}

export class GenerateLetterBatchDto {
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  parcelWorkflowStatus?: string;

  @IsOptional()
  @IsString()
  parcelStatus?: string;
}

export class UpdateLetterStatusDto {
  @IsIn(['GERADA', 'ENTREGUE', 'DEVOLVIDA'])
  status!: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
}
