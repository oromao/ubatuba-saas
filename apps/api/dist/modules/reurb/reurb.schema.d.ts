import { Document, Types } from 'mongoose';
export type FamilyStatus = 'APTA' | 'PENDENTE' | 'IRREGULAR';
export type PendencyStatus = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
export type ReurbDeliverableKind = 'PLANILHA_SINTESE' | 'BANCO_TABULADO_CSV' | 'BANCO_TABULADO_XLSX' | 'BANCO_TABULADO_JSON' | 'PACOTE_CARTORIO_ZIP';
export type ReurbProjectStatus = 'RASCUNHO' | 'EM_CAMPO' | 'EM_ANALISE' | 'EM_NOTIFICACOES' | 'PACOTE_CARTORIO' | 'CONCLUIDO';
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
        requiredProjectDocumentTypes: string[];
        requiredUnitDocumentTypes: string[];
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
export declare class ReurbProject {
    tenantId: Types.ObjectId;
    name: string;
    area?: string;
    reurbType: string;
    status: ReurbProjectStatus;
    startDate?: string;
    endDate?: string;
    responsibles: string[];
    metadata: Record<string, unknown>;
    statusHistory: Array<{
        id: string;
        previousStatus?: ReurbProjectStatus;
        nextStatus: ReurbProjectStatus;
        observation?: string;
        actorId?: Types.ObjectId;
        at: string;
    }>;
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
export type ReurbProjectDocument = ReurbProject & Document;
export declare const ReurbProjectSchema: import("mongoose").Schema<ReurbProject, import("mongoose").Model<ReurbProject, any, any, any, Document<unknown, any, ReurbProject, any, {}> & ReurbProject & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbProject, Document<unknown, {}, import("mongoose").FlatRecord<ReurbProject>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbProject> & {
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
export declare class ReurbUnit {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    code: string;
    block?: string;
    lot?: string;
    address?: string;
    area?: number;
    geometry?: Record<string, unknown>;
    familyIds: Types.ObjectId[];
    metadata: Record<string, unknown>;
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
export type ReurbUnitDocument = ReurbUnit & Document;
export declare const ReurbUnitSchema: import("mongoose").Schema<ReurbUnit, import("mongoose").Model<ReurbUnit, any, any, any, Document<unknown, any, ReurbUnit, any, {}> & ReurbUnit & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbUnit, Document<unknown, {}, import("mongoose").FlatRecord<ReurbUnit>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbUnit> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbNotificationTemplate {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    version: number;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
}
export type ReurbNotificationTemplateDocument = ReurbNotificationTemplate & Document;
export declare const ReurbNotificationTemplateSchema: import("mongoose").Schema<ReurbNotificationTemplate, import("mongoose").Model<ReurbNotificationTemplate, any, any, any, Document<unknown, any, ReurbNotificationTemplate, any, {}> & ReurbNotificationTemplate & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbNotificationTemplate, Document<unknown, {}, import("mongoose").FlatRecord<ReurbNotificationTemplate>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbNotificationTemplate> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ReurbNotification {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    templateId: Types.ObjectId;
    templateName: string;
    templateVersion: number;
    channel: 'EMAIL' | 'SMS';
    to: string;
    status: 'QUEUED' | 'SENT' | 'FAILED';
    payload: Record<string, unknown>;
    evidenceKeys: string[];
    error?: string;
    sentAt?: string;
    createdBy?: Types.ObjectId;
}
export type ReurbNotificationDocument = ReurbNotification & Document;
export declare const ReurbNotificationSchema: import("mongoose").Schema<ReurbNotification, import("mongoose").Model<ReurbNotification, any, any, any, Document<unknown, any, ReurbNotification, any, {}> & ReurbNotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReurbNotification, Document<unknown, {}, import("mongoose").FlatRecord<ReurbNotification>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ReurbNotification> & {
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
