import { Document, Types } from 'mongoose';
export declare class PortalSession {
    tokenHash: string;
    userId: Types.ObjectId;
    tenantId: Types.ObjectId;
    role: string;
    expiresAt: Date;
    context: Record<string, unknown>;
}
export type PortalSessionDocument = PortalSession & Document;
export declare const PortalSessionSchema: import("mongoose").Schema<PortalSession, import("mongoose").Model<PortalSession, any, any, any, Document<unknown, any, PortalSession, any, {}> & PortalSession & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PortalSession, Document<unknown, {}, import("mongoose").FlatRecord<PortalSession>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PortalSession> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
