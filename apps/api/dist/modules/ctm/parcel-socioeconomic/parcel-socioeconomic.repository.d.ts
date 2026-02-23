import { Model } from 'mongoose';
import { ParcelSocioeconomic, ParcelSocioeconomicDocument } from './parcel-socioeconomic.schema';
export declare class ParcelSocioeconomicRepository {
    private readonly model;
    constructor(model: Model<ParcelSocioeconomicDocument>);
    findByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, ParcelSocioeconomicDocument, {}, {}> & ParcelSocioeconomic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string, parcelId: string, data: Partial<ParcelSocioeconomic>): Promise<import("mongoose").Document<unknown, {}, ParcelSocioeconomicDocument, {}, {}> & ParcelSocioeconomic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
