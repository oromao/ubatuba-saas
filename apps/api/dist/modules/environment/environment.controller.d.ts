import { CreateEnvironmentCaseDto } from './dto/create-environment-case.dto';
import { UpdateEnvironmentCaseDto } from './dto/update-environment-case.dto';
import { EnvironmentService } from './environment.service';
export declare class EnvironmentController {
    private readonly service;
    constructor(service: EnvironmentService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    summary(req: {
        tenantId: string;
    }): Promise<{
        total: number;
        abertos: number;
        analise: number;
        campo: number;
        laudos: number;
        encerrados: number;
        tarefas: number;
        evidencias: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateEnvironmentCaseDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-case.schema").EnvironmentCaseDocument, {}, {}> & import("./environment-case.schema").EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateEnvironmentCaseDto): Promise<import("./environment-case.schema").EnvironmentCaseDocument>;
    issueReport(req: {
        tenantId: string;
    }, id: string): Promise<import("./environment-case.schema").EnvironmentCaseDocument>;
}
