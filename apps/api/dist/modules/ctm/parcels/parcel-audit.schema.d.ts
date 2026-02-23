import { Document, Types } from 'mongoose';
export declare class ParcelAuditLog {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, {
        before: unknown;
        after: unknown;
    }>;
    actorId?: Types.ObjectId;
}
export type ParcelAuditLogDocument = ParcelAuditLog & Document;
export declare const ParcelAuditLogSchema: import("mongoose").Schema<ParcelAuditLog, import("mongoose").Model<ParcelAuditLog, any, any, any, Document<unknown, any, ParcelAuditLog, any, {}> & ParcelAuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParcelAuditLog, Document<unknown, {}, import("mongoose").FlatRecord<ParcelAuditLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ParcelAuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
