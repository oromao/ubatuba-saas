import { Model } from 'mongoose';
import { ParcelInfrastructure, ParcelInfrastructureDocument } from './parcel-infrastructure.schema';
export declare class ParcelInfrastructureRepository {
    private readonly model;
    constructor(model: Model<ParcelInfrastructureDocument>);
    findByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, ParcelInfrastructureDocument, {}, {}> & ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string, parcelId: string, data: Partial<ParcelInfrastructure>): Promise<import("mongoose").Document<unknown, {}, ParcelInfrastructureDocument, {}, {}> & ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
