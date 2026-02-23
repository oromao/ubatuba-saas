import { Model } from 'mongoose';
import { Asset, AssetDocument } from './asset.schema';
export declare class AssetsRepository {
    private readonly model;
    constructor(model: Model<AssetDocument>);
    list(tenantId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, AssetDocument, {}, {}> & Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, AssetDocument, {}, {}> & Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Asset>): Promise<import("mongoose").Document<unknown, {}, AssetDocument, {}, {}> & Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, data: Partial<Asset>): Promise<(import("mongoose").Document<unknown, {}, AssetDocument, {}, {}> & Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, id: string): Promise<import("mongodb").DeleteResult>;
}
