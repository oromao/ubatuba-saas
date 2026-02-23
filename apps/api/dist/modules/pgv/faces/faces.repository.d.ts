import { Model } from 'mongoose';
import { PgvFace, PgvFaceDocument } from './face.schema';
export declare class FacesRepository {
    private readonly model;
    constructor(model: Model<PgvFaceDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByGeometry(tenantId: string, projectId: string, geometry: unknown): Promise<(import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PgvFace>): Promise<import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<PgvFace>): Promise<(import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, PgvFaceDocument, {}, {}> & PgvFace & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, PgvFaceDocument, "deleteOne", {}>;
}
