import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FamilyStatus, PendencyStatus, ReurbProjectStatus } from '../reurb.schema';

export class SpreadsheetColumnDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class TenantConfigSpreadsheetDto {
  @IsOptional()
  @IsString()
  templateVersion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpreadsheetColumnDto)
  columns?: SpreadsheetColumnDto[];
}

export class TenantConfigDocumentNamingDto {
  @IsOptional()
  @IsString()
  familyFolder?: string;

  @IsOptional()
  @IsString()
  spreadsheetFolder?: string;

  @IsOptional()
  @IsString()
  titlesFolder?: string;

  @IsOptional()
  @IsString()
  approvedDocumentsFolder?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocumentTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredProjectDocumentTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredUnitDocumentTypes?: string[];
}

export class TenantConfigValidationRulesDto {
  @IsOptional()
  @IsBoolean()
  blockOnPendingDocumentIssues?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAptaStatusForExports?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAptaStatusForCartorioPackage?: boolean;

  @IsOptional()
  @IsBoolean()
  failOnMissingRequiredFields?: boolean;
}

export class UpsertTenantConfigDto {
  @IsOptional()
  @IsBoolean()
  reurbEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFamilyFields?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantConfigSpreadsheetDto)
  spreadsheet?: TenantConfigSpreadsheetDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantConfigDocumentNamingDto)
  documentNaming?: TenantConfigDocumentNamingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TenantConfigValidationRulesDto)
  validationRules?: TenantConfigValidationRulesDto;
}

export class CreateReurbFamilyDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  familyCode!: string;

  @IsString()
  @IsNotEmpty()
  nucleus!: string;

  @IsString()
  @IsNotEmpty()
  responsibleName!: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  membersCount?: number;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsIn(['APTA', 'PENDENTE', 'IRREGULAR'])
  status?: FamilyStatus;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class ImportFamiliesCsvDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  csvContent!: string;

  @IsOptional()
  @IsString()
  delimiter?: string;
}

export class CreateReurbProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  reurbType?: string;

  @IsOptional()
  @IsIn(['RASCUNHO', 'EM_CAMPO', 'EM_ANALISE', 'EM_NOTIFICACOES', 'PACOTE_CARTORIO', 'CONCLUIDO'])
  status?: ReurbProjectStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibles?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateReurbProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  reurbType?: string;

  @IsOptional()
  @IsIn(['RASCUNHO', 'EM_CAMPO', 'EM_ANALISE', 'EM_NOTIFICACOES', 'PACOTE_CARTORIO', 'CONCLUIDO'])
  status?: ReurbProjectStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibles?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  statusObservation?: string;
}

export class CreateReurbUnitDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  lot?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  familyIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateReurbUnitDto {
  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  lot?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  familyIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateReurbFamilyDto {
  @IsOptional()
  @IsString()
  nucleus?: string;

  @IsOptional()
  @IsString()
  responsibleName?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  membersCount?: number;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsIn(['APTA', 'PENDENTE', 'IRREGULAR'])
  status?: FamilyStatus;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class CreatePendencyDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  familyId?: string;

  @IsString()
  @IsNotEmpty()
  nucleus!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  missingDocument!: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsIn(['ABERTA', 'EM_ANALISE', 'RESOLVIDA'])
  status?: PendencyStatus;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsString()
  @IsNotEmpty()
  responsible!: string;
}

export class UpdatePendencyStatusDto {
  @IsIn(['ABERTA', 'EM_ANALISE', 'RESOLVIDA'])
  status!: PendencyStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observation?: string;
}

export class RequestDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  familyId!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class RequestProjectDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CompleteProjectDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsIn(['PENDENTE', 'APROVADO', 'REPROVADO'])
  status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class RequestUnitDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CompleteUnitDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsIn(['PENDENTE', 'APROVADO', 'REPROVADO'])
  status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SendNotificationEmailDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsString()
  @IsNotEmpty()
  to!: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string | number>;
}

export class RequestNotificationEvidenceUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class AttachNotificationEvidenceDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  key!: string;
}

export class IntegrationPingDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class CompleteDocumentUploadDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  familyId!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsOptional()
  @IsIn(['PENDENTE', 'APROVADO', 'REPROVADO'])
  status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class DeliverableCommandDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
