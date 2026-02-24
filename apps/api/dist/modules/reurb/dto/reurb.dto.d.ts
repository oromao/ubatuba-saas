import { FamilyStatus, PendencyStatus, ReurbProjectStatus } from '../reurb.schema';
export declare class SpreadsheetColumnDto {
    key: string;
    label: string;
    required?: boolean;
}
export declare class TenantConfigSpreadsheetDto {
    templateVersion?: string;
    columns?: SpreadsheetColumnDto[];
}
export declare class TenantConfigDocumentNamingDto {
    familyFolder?: string;
    spreadsheetFolder?: string;
    titlesFolder?: string;
    approvedDocumentsFolder?: string;
    requiredDocumentTypes?: string[];
    requiredProjectDocumentTypes?: string[];
    requiredUnitDocumentTypes?: string[];
}
export declare class TenantConfigValidationRulesDto {
    blockOnPendingDocumentIssues?: boolean;
    requireAptaStatusForExports?: boolean;
    requireAptaStatusForCartorioPackage?: boolean;
    failOnMissingRequiredFields?: boolean;
}
export declare class UpsertTenantConfigDto {
    reurbEnabled?: boolean;
    requiredFamilyFields?: string[];
    spreadsheet?: TenantConfigSpreadsheetDto;
    documentNaming?: TenantConfigDocumentNamingDto;
    validationRules?: TenantConfigValidationRulesDto;
}
export declare class CreateReurbFamilyDto {
    projectId?: string;
    familyCode: string;
    nucleus: string;
    responsibleName: string;
    cpf?: string;
    address?: string;
    membersCount?: number;
    monthlyIncome?: number;
    status?: FamilyStatus;
    data?: Record<string, unknown>;
}
export declare class ImportFamiliesCsvDto {
    projectId?: string;
    csvContent: string;
    delimiter?: string;
}
export declare class CreateReurbProjectDto {
    name: string;
    area?: string;
    reurbType?: string;
    status?: ReurbProjectStatus;
    startDate?: string;
    endDate?: string;
    responsibles?: string[];
    metadata?: Record<string, unknown>;
}
export declare class UpdateReurbProjectDto {
    name?: string;
    area?: string;
    reurbType?: string;
    status?: ReurbProjectStatus;
    startDate?: string;
    endDate?: string;
    responsibles?: string[];
    metadata?: Record<string, unknown>;
    statusObservation?: string;
}
export declare class CreateReurbUnitDto {
    projectId?: string;
    code: string;
    block?: string;
    lot?: string;
    address?: string;
    area?: number;
    geometry?: Record<string, unknown>;
    familyIds?: string[];
    metadata?: Record<string, unknown>;
}
export declare class UpdateReurbUnitDto {
    block?: string;
    lot?: string;
    address?: string;
    area?: number;
    geometry?: Record<string, unknown>;
    familyIds?: string[];
    metadata?: Record<string, unknown>;
}
export declare class UpdateReurbFamilyDto {
    nucleus?: string;
    responsibleName?: string;
    cpf?: string;
    address?: string;
    membersCount?: number;
    monthlyIncome?: number;
    status?: FamilyStatus;
    data?: Record<string, unknown>;
}
export declare class CreatePendencyDto {
    projectId?: string;
    familyId?: string;
    nucleus: string;
    documentType: string;
    missingDocument: string;
    dueDate?: string;
    status?: PendencyStatus;
    observation?: string;
    responsible: string;
}
export declare class UpdatePendencyStatusDto {
    status: PendencyStatus;
    observation?: string;
}
export declare class RequestDocumentUploadDto {
    projectId?: string;
    familyId: string;
    documentType: string;
    fileName: string;
    mimeType?: string;
    metadata?: Record<string, unknown>;
}
export declare class RequestProjectDocumentUploadDto {
    projectId?: string;
    documentType: string;
    fileName: string;
    mimeType?: string;
    metadata?: Record<string, unknown>;
}
export declare class CompleteProjectDocumentUploadDto {
    projectId?: string;
    documentType: string;
    key: string;
    fileName: string;
    status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
    metadata?: Record<string, unknown>;
}
export declare class RequestUnitDocumentUploadDto {
    projectId?: string;
    unitId: string;
    documentType: string;
    fileName: string;
    mimeType?: string;
    metadata?: Record<string, unknown>;
}
export declare class CompleteUnitDocumentUploadDto {
    projectId?: string;
    unitId: string;
    documentType: string;
    key: string;
    fileName: string;
    status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
    metadata?: Record<string, unknown>;
}
export declare class CreateNotificationTemplateDto {
    projectId?: string;
    name: string;
    subject: string;
    body: string;
}
export declare class UpdateNotificationTemplateDto {
    subject?: string;
    body?: string;
    isActive?: boolean;
}
export declare class SendNotificationEmailDto {
    projectId?: string;
    templateId: string;
    to: string;
    variables?: Record<string, string | number>;
}
export declare class RequestNotificationEvidenceUploadDto {
    projectId?: string;
    fileName?: string;
    mimeType?: string;
}
export declare class AttachNotificationEvidenceDto {
    projectId?: string;
    key: string;
}
export declare class IntegrationPingDto {
    projectId?: string;
    payload?: Record<string, unknown>;
}
export declare class CompleteDocumentUploadDto {
    projectId?: string;
    familyId: string;
    documentType: string;
    key: string;
    fileName: string;
    status?: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
    metadata?: Record<string, unknown>;
}
export declare class DeliverableCommandDto {
    projectId?: string;
}
