import { Model, Types } from 'mongoose';
import { ReurbAuditLog, ReurbAuditLogDocument, ReurbDeliverable, ReurbDeliverableDocument, ReurbDocumentPendency, ReurbDocumentPendencyDocument, ReurbFamily, ReurbFamilyDocument, TenantConfig, TenantConfigDocument } from './reurb.schema';
export declare class ReurbRepository {
    private readonly tenantConfigModel;
    private readonly familyModel;
    private readonly pendencyModel;
    private readonly deliverableModel;
    private readonly auditModel;
    constructor(tenantConfigModel: Model<TenantConfigDocument>, familyModel: Model<ReurbFamilyDocument>, pendencyModel: Model<ReurbDocumentPendencyDocument>, deliverableModel: Model<ReurbDeliverableDocument>, auditModel: Model<ReurbAuditLogDocument>);
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
}
