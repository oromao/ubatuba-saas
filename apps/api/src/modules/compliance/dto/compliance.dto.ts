import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ComplianceChecklistStatus } from '../compliance.schema';

export class UpsertCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  legalName?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  mdRegistry?: string;

  @IsOptional()
  @IsString()
  mdRegistryValidUntil?: string;

  @IsOptional()
  @IsString()
  creaCauNumber?: string;

  @IsOptional()
  @IsString()
  creaCauValidUntil?: string;
}

export class UpsertResponsibleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  creaCauNumber?: string;

  @IsOptional()
  @IsIn(['CREA', 'CAU'])
  registryType?: 'CREA' | 'CAU';

  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class UpsertArtRrtDto {
  @IsIn(['ART', 'RRT'])
  type!: 'ART' | 'RRT';

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsString()
  surveyId?: string;

  @IsOptional()
  @IsString()
  projectRef?: string;

  @IsOptional()
  @IsString()
  fileKey?: string;
}

export class UpsertCatDto {
  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsString()
  surveyId?: string;

  @IsOptional()
  @IsString()
  projectRef?: string;

  @IsOptional()
  @IsString()
  fileKey?: string;
}

export class UpsertTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignments?: string[];

  @IsOptional()
  @IsString()
  curriculumKey?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceKeys?: string[];
}

export class UpsertChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  requirementCode!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(['OK', 'PENDENTE', 'EXPIRADO'])
  status!: ComplianceChecklistStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceKeys?: string[];
}

