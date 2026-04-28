import { Model } from 'mongoose';
import { PgvFactorSet, PgvFactorSetDocument } from './factor-set.schema';
export declare class FactorSetsRepository {
    private readonly model;
    constructor(model: Model<PgvFactorSetDocument>);
    findByProject(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, PgvFactorSetDocument, {}, {}> & PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string, data: Partial<PgvFactorSet>): Promise<import("mongoose").Document<unknown, {}, PgvFactorSetDocument, {}, {}> & PgvFactorSet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
