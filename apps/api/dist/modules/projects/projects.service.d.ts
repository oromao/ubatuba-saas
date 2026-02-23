import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private readonly projectsRepository;
    constructor(projectsRepository: ProjectsRepository);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./project.schema").ProjectDocument, {}, {}> & import("./project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./project.schema").ProjectDocument, {}, {}> & import("./project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    resolveProjectId(tenantId: string, projectId?: string): Promise<import("mongoose").Types.ObjectId>;
    create(tenantId: string, dto: CreateProjectDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./project.schema").ProjectDocument, {}, {}> & import("./project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateProjectDto): Promise<(import("mongoose").Document<unknown, {}, import("./project.schema").ProjectDocument, {}, {}> & import("./project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
