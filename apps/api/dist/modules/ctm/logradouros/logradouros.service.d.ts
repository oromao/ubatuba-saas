import { LogradourosRepository } from './logradouros.repository';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class LogradourosService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: LogradourosRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId: string | undefined): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, projectId: string | undefined, dto: CreateLogradouroDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateLogradouroDto): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<import("mongodb").DeleteResult>;
}
