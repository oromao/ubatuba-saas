import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CreateEnvironmentCaseDto } from './dto/create-environment-case.dto';
import { UpdateEnvironmentCaseDto } from './dto/update-environment-case.dto';
import { EnvironmentRepository } from './environment.repository';
export declare class EnvironmentService {
    private readonly repository;
    private readonly projectsService;
    private readonly storage;
    private readonly cacheService;
    constructor(repository: EnvironmentRepository, projectsService: ProjectsService, storage: ObjectStorageService, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateEnvironmentCaseDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateEnvironmentCaseDto, actorId?: string): Promise<import("./environment-case.schema").EnvironmentCaseDocument>;
    issueReport(tenantId: string, id: string): Promise<import("./environment-case.schema").EnvironmentCaseDocument>;
    summary(tenantId: string): Promise<{
        total: number;
        abertos: number;
        analise: number;
        campo: number;
        laudos: number;
        encerrados: number;
        tarefas: number;
        evidencias: number;
    }>;
}
