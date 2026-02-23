import { LogradourosService } from './logradouros.service';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
export declare class LogradourosController {
    private readonly logradourosService;
    constructor(logradourosService: LogradourosService);
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: CreateLogradouroDto): Promise<import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateLogradouroDto): Promise<(import("mongoose").Document<unknown, {}, import("./logradouro.schema").LogradouroDocument, {}, {}> & import("./logradouro.schema").Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<import("mongodb").DeleteResult>;
}
