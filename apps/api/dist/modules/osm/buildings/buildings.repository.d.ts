import { Model } from 'mongoose';
import { Building, BuildingDocument } from './building.schema';
export declare class BuildingsRepository {
    private readonly model;
    constructor(model: Model<BuildingDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, BuildingDocument, {}, {}> & Building & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    insertMany(data: Partial<Building>[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, BuildingDocument, {}, {}> & Building & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, Omit<Partial<Building>[], "_id">>[]>;
}
