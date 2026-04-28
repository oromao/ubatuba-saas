import { VersionsRepository } from './versions.repository';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class VersionsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: VersionsRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getActiveOrDefault(tenantId: string, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByNameOrYear(tenantId: string, projectId: string | undefined, value: string): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateVersionDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateVersionDto): Promise<(import("mongoose").Document<unknown, {}, import("./version.schema").PgvVersionDocument, {}, {}> & import("./version.schema").PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
