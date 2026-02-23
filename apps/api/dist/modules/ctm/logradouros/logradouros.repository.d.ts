import { Model } from 'mongoose';
import { Logradouro, LogradouroDocument } from './logradouro.schema';
export declare class LogradourosRepository {
    private readonly model;
    constructor(model: Model<LogradouroDocument>);
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, LogradouroDocument, {}, {}> & Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, LogradouroDocument, {}, {}> & Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Logradouro>): Promise<import("mongoose").Document<unknown, {}, LogradouroDocument, {}, {}> & Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<Logradouro>): Promise<(import("mongoose").Document<unknown, {}, LogradouroDocument, {}, {}> & Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, LogradouroDocument, {}, {}> & Logradouro & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, LogradouroDocument, "deleteOne", {}>;
}
