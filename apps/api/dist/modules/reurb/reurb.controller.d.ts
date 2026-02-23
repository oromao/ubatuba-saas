import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CompleteDocumentUploadDto, CreatePendencyDto, CreateReurbFamilyDto, DeliverableCommandDto, RequestDocumentUploadDto, UpdatePendencyStatusDto, UpdateReurbFamilyDto, UpsertTenantConfigDto } from './dto/reurb.dto';
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
    listFamilies(req: {
        tenantId: string;
    }, projectId?: string, status?: string, nucleus?: string, q?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbFamilyDocument, {}, {}> & import("./reurb.schema").ReurbFamily & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    }, dto: DeliverableCommandDto): Promise<{
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
    }, dto: DeliverableCommandDto): Promise<{
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
    }, dto: DeliverableCommandDto): Promise<{
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
    listPendencies(req: {
        tenantId: string;
    }, projectId?: string, status?: string, nucleus?: string, familyId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    generateCartorioPackage(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: DeliverableCommandDto): Promise<{
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
    }, projectId?: string, kind?: ReurbDeliverableKind): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDeliverableDocument, {}, {}> & import("./reurb.schema").ReurbDeliverable & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDeliverableDownload(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
}
