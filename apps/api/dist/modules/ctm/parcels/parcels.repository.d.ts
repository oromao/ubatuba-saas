import { Model } from 'mongoose';
import { Parcel, ParcelDocument } from './parcel.schema';
type ParcelFilters = {
    projectId: string;
    sqlu?: string;
    inscription?: string;
    inscricaoImobiliaria?: string;
    status?: string;
    workflowStatus?: string;
    bbox?: string;
    q?: string;
    zoneId?: string;
    faceId?: string;
};
export declare class ParcelsRepository {
    private readonly model;
    constructor(model: Model<ParcelDocument>);
    list(tenantId: string, filters: ParcelFilters): Promise<(import("mongoose").Document<unknown, {}, ParcelDocument, {}, {}> & Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, ParcelDocument, {}, {}> & Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Parcel>): Promise<import("mongoose").Document<unknown, {}, ParcelDocument, {}, {}> & Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<Parcel>): Promise<(import("mongoose").Document<unknown, {}, ParcelDocument, {}, {}> & Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, ParcelDocument, {}, {}> & Parcel & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, ParcelDocument, "deleteOne", {}>;
}
export {};
