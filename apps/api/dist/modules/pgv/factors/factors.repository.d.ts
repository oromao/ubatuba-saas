import { Model } from 'mongoose';
import { PgvFactor, PgvFactorDocument } from './factor.schema';
export declare class FactorsRepository {
    private readonly model;
    constructor(model: Model<PgvFactorDocument>);
    list(tenantId: string, projectId: string, category?: string): Promise<(import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findDefault(tenantId: string, projectId: string, category: string): Promise<(import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PgvFactor>): Promise<import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvFactor>): Promise<(import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, PgvFactorDocument, {}, {}> & PgvFactor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, PgvFactorDocument, "deleteOne", {}>;
}
