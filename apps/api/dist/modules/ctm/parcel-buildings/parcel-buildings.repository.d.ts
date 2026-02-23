import { Model } from 'mongoose';
import { ParcelBuilding, ParcelBuildingDocument } from './parcel-building.schema';
export declare class ParcelBuildingsRepository {
    private readonly model;
    constructor(model: Model<ParcelBuildingDocument>);
    findByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, ParcelBuildingDocument, {}, {}> & ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string, parcelId: string, data: Partial<ParcelBuilding>): Promise<import("mongoose").Document<unknown, {}, ParcelBuildingDocument, {}, {}> & ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
