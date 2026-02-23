import { Model } from 'mongoose';
import { ParcelAuditLog, ParcelAuditLogDocument } from './parcel-audit.schema';
export declare class ParcelAuditRepository {
    private readonly model;
    constructor(model: Model<ParcelAuditLogDocument>);
    create(data: Partial<ParcelAuditLog>): Promise<import("mongoose").Document<unknown, {}, ParcelAuditLogDocument, {}, {}> & ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, ParcelAuditLogDocument, {}, {}> & ParcelAuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
