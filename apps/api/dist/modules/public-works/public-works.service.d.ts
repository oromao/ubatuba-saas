import { DeleteResult } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddMeasurementDto } from './dto/add-measurement.dto';
import { AdvancePublicWorkDto } from './dto/advance-public-work.dto';
import { CreatePublicWorkDto } from './dto/create-public-work.dto';
import { UpdatePublicWorkDto } from './dto/update-public-work.dto';
import { PublicWorksRepository } from './public-works.repository';
export declare class PublicWorksService {
    private readonly repository;
    private readonly projectsService;
    private readonly cacheService;
    constructor(repository: PublicWorksRepository, projectsService: ProjectsService, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreatePublicWorkDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./public-work.schema").PublicWorkDocument, {}, {}> & import("./public-work.schema").PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdatePublicWorkDto, actorId?: string): Promise<import("./public-work.schema").PublicWorkDocument>;
    advanceStage(tenantId: string, id: string, dto: AdvancePublicWorkDto, actorId?: string): Promise<import("./public-work.schema").PublicWorkDocument>;
    addMeasurement(tenantId: string, id: string, dto: AddMeasurementDto, actorId?: string): Promise<import("./public-work.schema").PublicWorkDocument>;
    addEvidence(tenantId: string, id: string, dto: AddEvidenceDto, actorId?: string): Promise<import("./public-work.schema").PublicWorkDocument>;
    remove(tenantId: string, id: string): Promise<DeleteResult>;
    summary(tenantId: string): Promise<{
        total: number;
        planejadas: number;
        execucao: number;
        contratadas: number;
        concluidas: number;
        progressoMedio: number;
        medicoes: number;
        evidencias: number;
    }>;
}
