import { Model } from 'mongoose';
import { UrbanFurniture, UrbanFurnitureDocument } from './urban-furniture.schema';
export declare class UrbanFurnitureRepository {
    private readonly model;
    constructor(model: Model<UrbanFurnitureDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, UrbanFurnitureDocument, {}, {}> & UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, UrbanFurnitureDocument, {}, {}> & UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<UrbanFurniture>): Promise<import("mongoose").Document<unknown, {}, UrbanFurnitureDocument, {}, {}> & UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<UrbanFurniture>): Promise<(import("mongoose").Document<unknown, {}, UrbanFurnitureDocument, {}, {}> & UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, UrbanFurnitureDocument, {}, {}> & UrbanFurniture & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, UrbanFurnitureDocument, "deleteOne", {}>;
}
