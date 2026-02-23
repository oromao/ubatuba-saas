import { FactorSetsRepository } from './factor-sets.repository';
import { ProjectsService } from '../../projects/projects.service';
import { UpdateFactorSetDto } from './dto/update-factor-set.dto';
export declare class FactorSetsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: FactorSetsRepository, projectsService: ProjectsService);
    get(tenantId: string, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./factor-set.schema").PgvFactorSetDocument, {}, {}> & import("./factor-set.schema").PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, dto: UpdateFactorSetDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./factor-set.schema").PgvFactorSetDocument, {}, {}> & import("./factor-set.schema").PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
