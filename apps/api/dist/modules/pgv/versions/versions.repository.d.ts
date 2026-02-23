import { Model } from 'mongoose';
import { PgvVersion, PgvVersionDocument } from './version.schema';
export declare class VersionsRepository {
    private readonly model;
    constructor(model: Model<PgvVersionDocument>);
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findActive(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByNameOrYear(tenantId: string, projectId: string, value: string): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PgvVersion>): Promise<import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvVersion>): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    setActive(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PgvVersionDocument, {}, {}> & PgvVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
