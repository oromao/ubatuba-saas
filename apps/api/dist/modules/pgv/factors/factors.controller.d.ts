import { FactorsService } from './factors.service';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
export declare class FactorsController {
    private readonly factorsService;
    constructor(factorsService: FactorsService);
    list(req: {
        tenantId: string;
    }, projectId?: string, category?: string): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateFactorDto): Promise<import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, projectId: string | undefined, dto: UpdateFactorDto): Promise<(import("mongoose").Document<unknown, {}, import("./factor.schema").PgvFactorDocument, {}, {}> & import("./factor.schema").PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: {
        tenantId: string;
    }, id: string, projectId?: string): Promise<{
        success: boolean;
    }>;
}
