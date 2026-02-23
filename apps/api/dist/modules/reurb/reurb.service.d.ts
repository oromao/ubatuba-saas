import { EventEmitter } from 'events';
import { Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CompleteDocumentUploadDto, CreatePendencyDto, CreateReurbFamilyDto, RequestDocumentUploadDto, UpdatePendencyStatusDto, UpdateReurbFamilyDto, UpsertTenantConfigDto } from './dto/reurb.dto';
import { ReurbDeliverableKind, ReurbFamily, TenantConfig } from './reurb.schema';
import { ReurbRepository } from './reurb.repository';
import { ReurbValidationService } from './reurb-validation.service';
export declare class ReurbService {
    private readonly repository;
    private readonly projectsService;
    private readonly storage;
    private readonly validationService;
    private readonly pendencyEvents;
    constructor(repository: ReurbRepository, projectsService: ProjectsService, storage: ObjectStorageService, validationService: ReurbValidationService);
    getPendencyEvents(): EventEmitter<[never]>;
    private sanitizeName;
    private resolveProjectId;
    private loadConfig;
    private normalizeColumns;
    private familyRowsForExport;
    private validateAndAudit;
    getTenantConfig(tenantId: string): Promise<import("mongoose").Document<unknown, {}, import("./reurb.schema").TenantConfigDocument, {}, {}> & TenantConfig & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    listFamilies(tenantId: string, projectId?: string, filters?: {
        status?: string;
        nucleus?: string;
        q?: string;
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
    exportFamiliesCsv(tenantId: string, projectId: string | undefined, actorId?: string): Promise<{
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
    exportFamiliesXlsx(tenantId: string, projectId: string | undefined, actorId?: string): Promise<{
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
    generatePlanilhaSintese(tenantId: string, projectId: string | undefined, actorId?: string): Promise<{
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
    }): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDocumentPendencyDocument, {}, {}> & import("./reurb.schema").ReurbDocumentPendency & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
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
    generateCartorioPackage(tenantId: string, projectId: string | undefined, actorId?: string): Promise<{
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
    listDeliverables(tenantId: string, projectId?: string, kind?: ReurbDeliverableKind): Promise<(import("mongoose").Document<unknown, {}, import("./reurb.schema").ReurbDeliverableDocument, {}, {}> & import("./reurb.schema").ReurbDeliverable & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDeliverableDownload(tenantId: string, deliverableId: string, projectId?: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    private persistDeliverable;
}
