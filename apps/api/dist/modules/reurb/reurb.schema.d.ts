import { Document, Types } from 'mongoose';
export type FamilyStatus = 'APTA' | 'PENDENTE' | 'IRREGULAR';
export type PendencyStatus = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
export type ReurbDeliverableKind = 'PLANILHA_SINTESE' | 'BANCO_TABULADO_CSV' | 'BANCO_TABULADO_XLSX' | 'PACOTE_CARTORIO_ZIP';
export declare class TenantConfig {
    tenantId: Types.ObjectId;
    reurbEnabled: boolean;
    requiredFamilyFields: string[];
    spreadsheet: {
        templateVersion: string;
        columns: Array<{
            key: string;
            label: string;
            required?: boolean;
        }>;
    };
    documentNaming: {
        familyFolder: string;
        spreadsheetFolder: string;
        titlesFolder: string;
        approvedDocumentsFolder: string;
        requiredDocumentTypes: string[];
    };
    validationRules: {
        blockOnPendingDocumentIssues: boolean;
        requireAptaStatusForExports: boolean;
        requireAptaStatusForCartorioPackage: boolean;
        failOnMissingRequiredFields: boolean;
    };
    updatedBy?: Types.ObjectId;
}
export type TenantConfigDocument = TenantConfig & Document;
export declare const TenantConfigSchema: import("mongoose").Schema<TenantConfig, import("mongoose").Model<TenantConfig, any, any, any, Document<unknown, any, TenantConfig, any, {}> & TenantConfig & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TenantConfig, Document<unknown, {}, import("mongoose").FlatRecord<TenantConfig>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TenantConfig> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbFamily {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    familyCode: string;
    nucleus: string;
    responsibleName: string;
    cpf?: string;
    address?: string;
    membersCount: number;
    monthlyIncome?: number;
    status: FamilyStatus;
    data: Record<string, unknown>;
    documents: Array<{
        id: string;
        documentType: string;
        name: string;
        key: string;
        version: number;
        status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
        metadata?: Record<string, unknown>;
        uploadedBy?: Types.ObjectId;
        uploadedAt: string;
    }>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ReurbFamilyDocument = ReurbFamily & Document;
export declare const ReurbFamilySchema: import("mongoose").Schema<ReurbFamily, import("mongoose").Model<ReurbFamily, any, any, any, Document<unknown, any, ReurbFamily, any, {}> & ReurbFamily & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbFamily, Document<unknown, {}, import("mongoose").FlatRecord<ReurbFamily>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbFamily> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbDocumentPendency {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    familyId?: Types.ObjectId;
    nucleus: string;
    documentType: string;
    missingDocument: string;
    dueDate?: string;
    status: PendencyStatus;
    observation?: string;
    responsible: string;
    statusHistory: Array<{
        id: string;
        previousStatus?: PendencyStatus;
        nextStatus: PendencyStatus;
        observation?: string;
        actorId?: Types.ObjectId;
        at: string;
    }>;
    updatedBy?: Types.ObjectId;
}
export type ReurbDocumentPendencyDocument = ReurbDocumentPendency & Document;
export declare const ReurbDocumentPendencySchema: import("mongoose").Schema<ReurbDocumentPendency, import("mongoose").Model<ReurbDocumentPendency, any, any, any, Document<unknown, any, ReurbDocumentPendency, any, {}> & ReurbDocumentPendency & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbDocumentPendency, Document<unknown, {}, import("mongoose").FlatRecord<ReurbDocumentPendency>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbDocumentPendency> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbDeliverable {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    kind: ReurbDeliverableKind;
    version: number;
    fileName: string;
    key: string;
    hashSha256: string;
    validationErrors: Array<{
        code: string;
        message: string;
        field?: string;
        familyId?: string;
    }>;
    metadata: Record<string, unknown>;
    generatedBy: Types.ObjectId;
    generatedAt: string;
}
export type ReurbDeliverableDocument = ReurbDeliverable & Document;
export declare const ReurbDeliverableSchema: import("mongoose").Schema<ReurbDeliverable, import("mongoose").Model<ReurbDeliverable, any, any, any, Document<unknown, any, ReurbDeliverable, any, {}> & ReurbDeliverable & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbDeliverable, Document<unknown, {}, import("mongoose").FlatRecord<ReurbDeliverable>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbDeliverable> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbAuditLog {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    action: string;
    success: boolean;
    errors: Array<{
        code: string;
        message: string;
        field?: string;
        familyId?: string;
    }>;
    details: Record<string, unknown>;
    actorId?: Types.ObjectId;
    happenedAt: string;
}
export type ReurbAuditLogDocument = ReurbAuditLog & Document;
export declare const ReurbAuditLogSchema: import("mongoose").Schema<ReurbAuditLog, import("mongoose").Model<ReurbAuditLog, any, any, any, Document<unknown, any, ReurbAuditLog, any, {}> & ReurbAuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbAuditLog, Document<unknown, {}, import("mongoose").FlatRecord<ReurbAuditLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbAuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
