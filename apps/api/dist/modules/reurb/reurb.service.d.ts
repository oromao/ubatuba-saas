import { EventEmitter } from 'events';
import { Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CompleteDocumentUploadDto, CompleteProjectDocumentUploadDto, CompleteUnitDocumentUploadDto, CreatePendencyDto, CreateReurbFamilyDto, CreateReurbProjectDto, CreateReurbUnitDto, RequestDocumentUploadDto, RequestProjectDocumentUploadDto, RequestUnitDocumentUploadDto, ImportFamiliesCsvDto, UpdatePendencyStatusDto, UpdateReurbFamilyDto, UpdateReurbProjectDto, UpdateReurbUnitDto, UpsertTenantConfigDto } from './dto/reurb.dto';
import { ReurbDeliverableKind, ReurbFamily, ReurbProjectStatus, TenantConfig } from './reurb.schema';
import { ReurbRepository } from './reurb.repository';
import { ReurbValidationService } from './reurb-validation.service';
export declare class ReurbService {
    private readonly repository;
    private readonly projectsService;
    private readonly storage;
    private readonly validationService;
    private readonly pendencyEvents;
    private readonly mailTransport;
    constructor(repository: ReurbRepository, projectsService: ProjectsService, storage: ObjectStorageService, validationService: ReurbValidationService);
    getPendencyEvents(): EventEmitter<[never]>;
    private sanitizeName;
    private resolveProjectId;
    private loadConfig;
    private normalizeColumns;
    private familyRowsForExport;
    private validateAndAudit;
    private auditAccess;
    getTenantConfig(tenantId: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").TenantConfigDocument, {}, {}> & TenantConfig & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createProject(tenantId: string, dto: CreateReurbProjectDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listProjects(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateProject(tenantId: string, projectId: string, dto: UpdateReurbProjectDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertTenantConfig(tenantId: string, dto: UpsertTenantConfigDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").TenantConfigDocument, {}, {}> & TenantConfig & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createFamily(tenantId: string, dto: CreateReurbFamilyDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    importFamiliesCsv(tenantId: string, dto: ImportFamiliesCsvDto, actorId?: string): Promise<{
        total: number;
        created: number;
        errors: {
            row: number;
            message: string;
            data: string[];
        }[];
    }>;
    listFamilies(tenantId: string, projectId?: string, filters?: {
        status?: string;
        nucleus?: string;
        q?: string;
    }, params?: {
        actorId?: string;
        purpose?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateFamily(tenantId: string, familyId: string, dto: UpdateReurbFamilyDto, projectId?: string, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    exportFamiliesCsv(tenantId: string, projectId: string | undefined, actorId?: string, purpose?: string): Promise<{
        hashSha256: string;
        tenantId: Types.ObjectId;
        projectId: Types.ObjectId;
        kind: ReurbDeliverableKind;
        version: number;
        fileName: string;
        key: string;
        validationErrors: Array<{
            code: string;
            message: string;
            field?: string;
            familyId?: string;
        }>;
        metadata: Record<string, unknown>;
        generatedBy: Types.ObjectId;
        generatedAt: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    exportFamiliesXlsx(tenantId: string, projectId: string | undefined, actorId?: string, purpose?: string): Promise<{
        hashSha256: string;
        tenantId: Types.ObjectId;
        projectId: Types.ObjectId;
        kind: ReurbDeliverableKind;
        version: number;
        fileName: string;
        key: string;
        validationErrors: Array<{
            code: string;
            message: string;
            field?: string;
            familyId?: string;
        }>;
        metadata: Record<string, unknown>;
        generatedBy: Types.ObjectId;
        generatedAt: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    generatePlanilhaSintese(tenantId: string, projectId: string | undefined, actorId?: string, purpose?: string): Promise<{
        hashSha256: string;
        tenantId: Types.ObjectId;
        projectId: Types.ObjectId;
        kind: ReurbDeliverableKind;
        version: number;
        fileName: string;
        key: string;
        validationErrors: Array<{
            code: string;
            message: string;
            field?: string;
            familyId?: string;
        }>;
        metadata: Record<string, unknown>;
        generatedBy: Types.ObjectId;
        generatedAt: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    createPendency(tenantId: string, dto: CreatePendencyDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listPendencies(tenantId: string, projectId?: string, filters?: {
        status?: string;
        nucleus?: string;
        familyId?: string;
    }, params?: {
        actorId?: string;
        purpose?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createUnit(tenantId: string, dto: CreateReurbUnitDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listUnits(tenantId: string, projectId?: string, filters?: {
        code?: string;
        block?: string;
        lot?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateUnit(tenantId: string, unitId: string, dto: UpdateReurbUnitDto, projectId?: string, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updatePendencyStatus(tenantId: string, pendencyId: string, dto: UpdatePendencyStatusDto, projectId?: string, actorId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    requestDocumentUpload(tenantId: string, dto: RequestDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeDocumentUpload(tenantId: string, dto: CompleteDocumentUploadDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & ReurbFamily & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    requestProjectDocumentUpload(tenantId: string, dto: RequestProjectDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeProjectDocumentUpload(tenantId: string, dto: CompleteProjectDocumentUploadDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    requestUnitDocumentUpload(tenantId: string, dto: RequestUnitDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeUnitDocumentUpload(tenantId: string, dto: CompleteUnitDocumentUploadDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listNotificationTemplates(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createNotificationTemplate(tenantId: string, dto: {
        projectId?: string;
        name: string;
        subject: string;
        body: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateNotificationTemplate(tenantId: string, projectId: string | undefined, templateId: string, dto: {
        subject?: string;
        body?: string;
        isActive?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listNotifications(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    sendNotificationEmail(params: {
        tenantId: string;
        projectId?: string;
        templateId: string;
        to: string;
        variables?: Record<string, string | number>;
        actorId?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    attachNotificationEvidence(tenantId: string, projectId: string | undefined, notificationId: string, key: string, actorId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    requestNotificationEvidenceUpload(tenantId: string, projectId?: string, fileName?: string, mimeType?: string): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    pingIntegration(tenantId: string, projectId: string | undefined, payload: Record<string, unknown>, actorId?: string): Promise<{
        status: string;
        url: string;
        response: unknown;
        error: string | undefined;
    }>;
    getDossierSummary(tenantId: string, projectId?: string): Promise<{
        project: {
            id: string;
            name: string;
            status: ReurbProjectStatus;
            missingDocuments: string[];
        };
        families: {
            familyId: string;
            missing: string[];
        }[];
        units: {
            unitId: string;
            missing: string[];
        }[];
    }>;
    generateCartorioPackage(tenantId: string, projectId: string | undefined, actorId?: string, purpose?: string): Promise<{
        hashSha256: string;
        tenantId: Types.ObjectId;
        projectId: Types.ObjectId;
        kind: ReurbDeliverableKind;
        version: number;
        fileName: string;
        key: string;
        validationErrors: Array<{
            code: string;
            message: string;
            field?: string;
            familyId?: string;
        }>;
        metadata: Record<string, unknown>;
        generatedBy: Types.ObjectId;
        generatedAt: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    exportFamiliesJson(tenantId: string, projectId: string | undefined, actorId?: string, purpose?: string): Promise<{
        hashSha256: string;
        tenantId: Types.ObjectId;
        projectId: Types.ObjectId;
        kind: ReurbDeliverableKind;
        version: number;
        fileName: string;
        key: string;
        validationErrors: Array<{
            code: string;
            message: string;
            field?: string;
            familyId?: string;
        }>;
        metadata: Record<string, unknown>;
        generatedBy: Types.ObjectId;
        generatedAt: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    listDeliverables(tenantId: string, projectId?: string, kind?: ReurbDeliverableKind, params?: {
        actorId?: string;
        purpose?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDeliverableDocument, {}, {}> & import("./reurb.schema").ReurbDeliverable & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDeliverableDownload(tenantId: string, deliverableId: string, projectId?: string, params?: {
        actorId?: string;
        purpose?: string;
    }): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    private persistDeliverable;
    listAuditLogs(tenantId: string, projectId?: string, action?: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbAuditLogDocument, {}, {}> & import("./reurb.schema").ReurbAuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
