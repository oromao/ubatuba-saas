import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { ProjectsService } from '../projects/projects.service';
import { CertificatesService } from '../certificates/certificates.service';
import { CreatePermitWorkDto } from './dto/create-permit-work.dto';
import { UpdatePermitWorkDto } from './dto/update-permit-work.dto';
import { PermitsWorksRepository } from './permits-works.repository';
import { PermitWorkRequestDocument } from './permit-work.schema';
export declare class PermitsWorksService {
    private readonly repository;
    private readonly projectsService;
    private readonly storage;
    private readonly cacheService;
    private readonly certificatesService?;
    constructor(repository: PermitsWorksRepository, projectsService: ProjectsService, storage: ObjectStorageService, cacheService: CacheService, certificatesService?: CertificatesService | undefined);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreatePermitWorkDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & import("./permit-work.schema").PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdatePermitWorkDto, actorId?: string): Promise<PermitWorkRequestDocument>;
    addInvoice(tenantId: string, id: string, description: string, amount: number): Promise<PermitWorkRequestDocument>;
    addRequirementResponse(tenantId: string, id: string, requirementId: string, note: string, actorId?: string): Promise<PermitWorkRequestDocument>;
    addEvidence(tenantId: string, id: string, title: string, note?: string, fileName?: string, actorId?: string): Promise<PermitWorkRequestDocument>;
    decide(tenantId: string, id: string, decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO', reason?: string, actorId?: string): Promise<PermitWorkRequestDocument>;
    issueDecisionPdf(tenantId: string, id: string): Promise<PermitWorkRequestDocument>;
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
