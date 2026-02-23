import { Model } from 'mongoose';
import { PgvValuation, PgvValuationDocument } from './valuation.schema';
export declare class ValuationsRepository {
    private readonly model;
    constructor(model: Model<PgvValuationDocument>);
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, PgvValuationDocument, {}, {}> & PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, PgvValuationDocument, {}, {}> & PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findLatestByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, PgvValuationDocument, {}, {}> & PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    listByVersion(tenantId: string, projectId: string, versionId: string): Promise<(import("mongoose").Document<unknown, {}, PgvValuationDocument, {}, {}> & PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(data: Partial<PgvValuation>): Promise<import("mongoose").Document<unknown, {}, PgvValuationDocument, {}, {}> & PgvValuation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
