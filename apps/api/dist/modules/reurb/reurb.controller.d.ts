import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CompleteDocumentUploadDto, CompleteProjectDocumentUploadDto, CompleteUnitDocumentUploadDto, CreatePendencyDto, CreateReurbFamilyDto, CreateReurbProjectDto, CreateReurbUnitDto, CreateNotificationTemplateDto, DeliverableCommandDto, IntegrationPingDto, ImportFamiliesCsvDto, RequestNotificationEvidenceUploadDto, RequestDocumentUploadDto, RequestProjectDocumentUploadDto, RequestUnitDocumentUploadDto, SendNotificationEmailDto, AttachNotificationEvidenceDto, UpdatePendencyStatusDto, UpdateReurbFamilyDto, UpdateReurbProjectDto, UpdateReurbUnitDto, UpdateNotificationTemplateDto, UpsertTenantConfigDto } from './dto/reurb.dto';
import { ReurbDeliverableKind } from './reurb.schema';
import { ReurbService } from './reurb.service';
export declare class ReurbController {
    private readonly service;
    constructor(service: ReurbService);
    getTenantConfig(req: {
        tenantId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").TenantConfigDocument, {}, {}> & import("./reurb.schema").TenantConfig & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertTenantConfig(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: UpsertTenantConfigDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").TenantConfigDocument, {}, {}> & import("./reurb.schema").TenantConfig & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createProject(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateReurbProjectDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listProjects(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateProject(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateReurbProjectDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createFamily(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateReurbFamilyDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & import("./reurb.schema").ReurbFamily & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    importFamilies(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: ImportFamiliesCsvDto): Promise<{
        total: number;
        created: number;
        errors: {
            row: number;
            message: string;
            data: string[];
        }[];
    }>;
    listFamilies(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, projectId?: string, status?: string, nucleus?: string, q?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & import("./reurb.schema").ReurbFamily & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateFamily(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpdateReurbFamilyDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & import("./reurb.schema").ReurbFamily & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    exportFamiliesCsv(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, dto: DeliverableCommandDto): Promise<{
        hashSha256: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
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
        generatedBy: import("mongoose").Types.ObjectId;
        generatedAt: string;
        _id: import("mongoose").Types.ObjectId;
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
    exportFamiliesXlsx(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, dto: DeliverableCommandDto): Promise<{
        hashSha256: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
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
        generatedBy: import("mongoose").Types.ObjectId;
        generatedAt: string;
        _id: import("mongoose").Types.ObjectId;
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
    exportFamiliesJson(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, dto: DeliverableCommandDto): Promise<{
        hashSha256: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
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
        generatedBy: import("mongoose").Types.ObjectId;
        generatedAt: string;
        _id: import("mongoose").Types.ObjectId;
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
    generatePlanilha(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, dto: DeliverableCommandDto): Promise<{
        hashSha256: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
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
        generatedBy: import("mongoose").Types.ObjectId;
        generatedAt: string;
        _id: import("mongoose").Types.ObjectId;
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
    createPendency(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreatePendencyDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createUnit(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateReurbUnitDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listUnits(req: {
        tenantId: string;
    }, projectId?: string, code?: string, block?: string, lot?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateUnit(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpdateReurbUnitDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listPendencies(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, projectId?: string, status?: string, nucleus?: string, familyId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updatePendencyStatus(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, projectId: string | undefined, dto: UpdatePendencyStatusDto): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    pendenciesStream(req: {
        tenantId: string;
    }): Observable<MessageEvent>;
    requestDocumentUpload(req: {
        tenantId: string;
    }, dto: RequestDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeDocumentUpload(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CompleteDocumentUploadDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & import("./reurb.schema").ReurbFamily & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    requestProjectDocumentUpload(req: {
        tenantId: string;
    }, dto: RequestProjectDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeProjectDocumentUpload(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CompleteProjectDocumentUploadDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbProjectDocument, {}, {}> & import("./reurb.schema").ReurbProject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    requestUnitDocumentUpload(req: {
        tenantId: string;
    }, dto: RequestUnitDocumentUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeUnitDocumentUpload(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CompleteUnitDocumentUploadDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbUnitDocument, {}, {}> & import("./reurb.schema").ReurbUnit & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDossierSummary(req: {
        tenantId: string;
    }, projectId?: string): Promise<{
        project: {
            id: string;
            name: string;
            status: import("./reurb.schema").ReurbProjectStatus;
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
    listNotificationTemplates(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createNotificationTemplate(req: {
        tenantId: string;
    }, dto: CreateNotificationTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateNotificationTemplate(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateNotificationTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationTemplateDocument, {}, {}> & import("./reurb.schema").ReurbNotificationTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listNotifications(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    sendNotificationEmail(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: SendNotificationEmailDto): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    requestNotificationEvidenceUpload(req: {
        tenantId: string;
    }, dto: RequestNotificationEvidenceUploadDto): Promise<{
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    attachNotificationEvidence(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: AttachNotificationEvidenceDto): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbNotificationDocument, {}, {}> & import("./reurb.schema").ReurbNotification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    pingIntegration(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: IntegrationPingDto): Promise<{
        status: string;
        url: string;
        response: unknown;
        error: string | undefined;
    }>;
    generateCartorioPackage(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, dto: DeliverableCommandDto): Promise<{
        hashSha256: string;
        tenantId: import("mongoose").Types.ObjectId;
        projectId: import("mongoose").Types.ObjectId;
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
        generatedBy: import("mongoose").Types.ObjectId;
        generatedAt: string;
        _id: import("mongoose").Types.ObjectId;
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
    listDeliverables(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, projectId?: string, kind?: ReurbDeliverableKind): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDeliverableDocument, {}, {}> & import("./reurb.schema").ReurbDeliverable & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDeliverableDownload(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, purpose: string | undefined, id: string, projectId?: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    listAuditLogs(req: {
        tenantId: string;
    }, projectId?: string, action?: string, limit?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbAuditLogDocument, {}, {}> & import("./reurb.schema").ReurbAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
