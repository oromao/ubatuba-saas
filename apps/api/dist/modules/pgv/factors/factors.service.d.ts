import { FactorsRepository } from './factors.repository';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class FactorsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: FactorsRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, category?: string): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateFactorDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateFactorDto): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
}
