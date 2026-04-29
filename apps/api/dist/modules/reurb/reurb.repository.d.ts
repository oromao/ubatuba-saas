import { Model, Types } from 'mongoose';
import { ReurbAuditLog, ReurbAuditLogDocument, ReurbDeliverable, ReurbDeliverableDocument, ReurbDocumentPendency, ReurbDocumentPendencyDocument, ReurbFamily, ReurbFamilyDocument, ReurbNotification, ReurbNotificationDocument, ReurbNotificationTemplate, ReurbNotificationTemplateDocument, ReurbProject, ReurbProjectDocument, ReurbUnit, ReurbUnitDocument, TenantConfig, TenantConfigDocument } from './reurb.schema';
export declare class ReurbRepository {
    private readonly tenantConfigModel;
    private readonly familyModel;
    private readonly projectModel;
    private readonly unitModel;
    private readonly notificationTemplateModel;
    private readonly notificationModel;
    private readonly pendencyModel;
    private readonly deliverableModel;
    private readonly auditModel;
    constructor(tenantConfigModel: Model<TenantConfigDocument>, familyModel: Model<ReurbFamilyDocument>, projectModel: Model<ReurbProjectDocument>, unitModel: Model<ReurbUnitDocument>, notificationTemplateModel: Model<ReurbNotificationTemplateDocument>, notificationModel: Model<ReurbNotificationDocument>, pendencyModel: Model<ReurbDocumentPendencyDocument>, deliverableModel: Model<ReurbDeliverableDocument>, auditModel: Model<ReurbAuditLogDocument>);
    findTenantConfig(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, TenantConfigDocument, {}, {}> & TenantConfig & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsertTenantConfig(tenantId: string, data: Partial<TenantConfig>): Promise<import("mongoose").Document<unknown, {}, TenantConfigDocument, {}, {}> & TenantConfig & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createProject(data: Partial<ReurbProject>): Promise<import("mongoose").Document<unknown, {}, ReurbProjectDocument, {}, {}> & ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listProjects(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbProjectDocument, {}, {}> & ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findProjectById(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbProjectDocument, {}, {}> & ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateProject(tenantId: string, projectId: string, data: Partial<ReurbProject>): Promise<(import("mongoose").Document<unknown, {}, ReurbProjectDocument, {}, {}> & ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    nextNotificationTemplateVersion(tenantId: string, projectId: string, name: string): Promise<number>;
    createNotificationTemplate(data: Partial<ReurbNotificationTemplate>): Promise<import("mongoose").Document<unknown, {}, ReurbNotificationTemplateDocument, {}, {}> & ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listNotificationTemplates(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationTemplateDocument, {}, {}> & ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findNotificationTemplateById(tenantId: string, projectId: string, templateId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationTemplateDocument, {}, {}> & ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateNotificationTemplate(tenantId: string, projectId: string, templateId: string, data: Partial<ReurbNotificationTemplate>): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationTemplateDocument, {}, {}> & ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createNotification(data: Partial<ReurbNotification>): Promise<import("mongoose").Document<unknown, {}, ReurbNotificationDocument, {}, {}> & ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listNotifications(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationDocument, {}, {}> & ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findNotificationById(tenantId: string, projectId: string, notificationId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationDocument, {}, {}> & ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateNotification(tenantId: string, projectId: string, notificationId: string, data: Partial<ReurbNotification>): Promise<(import("mongoose").Document<unknown, {}, ReurbNotificationDocument, {}, {}> & ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createFamily(data: Partial<ReurbFamily>): Promise<import("mongoose").Document<unknown, {}, ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listFamilies(tenantId: string, projectId: string, filters?: {
        status?: string;
        nucleus?: string;
        q?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findFamilyById(tenantId: string, projectId: string, familyId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateFamily(tenantId: string, projectId: string, familyId: string, data: Partial<ReurbFamily>): Promise<(import("mongoose").Document<unknown, {}, ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createUnit(data: Partial<ReurbUnit>): Promise<import("mongoose").Document<unknown, {}, ReurbUnitDocument, {}, {}> & ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listUnits(tenantId: string, projectId: string, filters?: {
        code?: string;
        block?: string;
        lot?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, ReurbUnitDocument, {}, {}> & ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findUnitById(tenantId: string, projectId: string, unitId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbUnitDocument, {}, {}> & ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateUnit(tenantId: string, projectId: string, unitId: string, data: Partial<ReurbUnit>): Promise<(import("mongoose").Document<unknown, {}, ReurbUnitDocument, {}, {}> & ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createPendency(data: Partial<ReurbDocumentPendency>): Promise<import("mongoose").Document<unknown, {}, ReurbDocumentPendencyDocument, {}, {}> & ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listPendencies(tenantId: string, projectId: string, filters?: {
        status?: string;
        nucleus?: string;
        familyId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, ReurbDocumentPendencyDocument, {}, {}> & ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findPendencyById(tenantId: string, projectId: string, pendencyId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbDocumentPendencyDocument, {}, {}> & ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updatePendencyStatus(tenantId: string, projectId: string, pendencyId: string, params: {
        status: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
        observation?: string;
        actorId?: Types.ObjectId;
        statusHistoryEntry: {
            id: string;
            previousStatus?: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
            nextStatus: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
            observation?: string;
            actorId?: Types.ObjectId;
            at: string;
        };
    }): Promise<(import("mongoose").Document<unknown, {}, ReurbDocumentPendencyDocument, {}, {}> & ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createDeliverable(data: Partial<ReurbDeliverable>): Promise<import("mongoose").Document<unknown, {}, ReurbDeliverableDocument, {}, {}> & ReurbDeliverable & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listDeliverables(tenantId: string, projectId: string, kind?: string): Promise<(import("mongoose").Document<unknown, {}, ReurbDeliverableDocument, {}, {}> & ReurbDeliverable & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findDeliverableById(tenantId: string, projectId: string, deliverableId: string): Promise<(import("mongoose").Document<unknown, {}, ReurbDeliverableDocument, {}, {}> & ReurbDeliverable & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    nextDeliverableVersion(tenantId: string, projectId: string, kind: string): Promise<number>;
    createAuditLog(data: Partial<ReurbAuditLog>): Promise<import("mongoose").Document<unknown, {}, ReurbAuditLogDocument, {}, {}> & ReurbAuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listAuditLogs(tenantId: string, projectId: string, filters?: {
        action?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, ReurbAuditLogDocument, {}, {}> & ReurbAuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
