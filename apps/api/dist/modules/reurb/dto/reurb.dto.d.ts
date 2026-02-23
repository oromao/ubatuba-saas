import { FamilyStatus, PendencyStatus } from '../reurb.schema';
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
