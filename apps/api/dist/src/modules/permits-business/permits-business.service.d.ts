import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CreatePermitBusinessDto } from './dto/create-permit-business.dto';
import { UpdatePermitBusinessDto } from './dto/update-permit-business.dto';
import { PermitsBusinessRepository } from './permits-business.repository';
export declare class PermitsBusinessService {
    private readonly repository;
    private readonly projectsService;
    private readonly storage;
    private readonly cacheService;
    constructor(repository: PermitsBusinessRepository, projectsService: ProjectsService, storage: ObjectStorageService, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreatePermitBusinessDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./permit-business.schema").PermitBusinessRequestDocument, {}, {}> & import("./permit-business.schema").PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdatePermitBusinessDto, actorId?: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    addTax(tenantId: string, id: string, description: string, amount: number): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    addRequirementResponse(tenantId: string, id: string, note: string, actorId?: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    addEvidence(tenantId: string, id: string, title: string, note?: string, fileName?: string, actorId?: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    decide(tenantId: string, id: string, decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO', reason?: string, actorId?: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    issuePermit(tenantId: string, id: string): Promise<import("./permit-business.schema").PermitBusinessRequestDocument>;
    private transition;
    importData(tenantId: string, data: any, fileName: string, sourceType: string, actorId?: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
        }[];
    }>;
    importCsv(tenantId: string, csv: string, fileName: string, sourceType: string, actorId?: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
        errorDetails: {
            row: number;
            featureId?: string;
            message: string;
        }[];
    }>;
}
