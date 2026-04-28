import { FactorSetsService } from './factor-sets.service';
import { UpdateFactorSetDto } from './dto/update-factor-set.dto';
export declare class FactorSetsController {
    private readonly factorSetsService;
    constructor(factorSetsService: FactorSetsService);
    get(req: {
        tenantId: string;
    }, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./factor-set.schema").PgvFactorSetDocument, {}, {}> & import("./factor-set.schema").PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: UpdateFactorSetDto): Promise<import("mongoose").Document<unknown, {}, import("./factor-set.schema").PgvFactorSetDocument, {}, {}> & import("./factor-set.schema").PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
