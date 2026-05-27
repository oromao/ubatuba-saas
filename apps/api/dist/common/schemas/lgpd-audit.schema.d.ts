import { Document } from 'mongoose';
export declare class LgpdAudit {
    tenantId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    fields?: string[];
    actorId?: string;
    actorRole?: string;
    ipAddress?: string;
    reason?: string;
    consentId?: string;
    anonymized: boolean;
}
export type LgpdAuditDocument = LgpdAudit & Document;
export declare const LgpdAuditSchema: import("mongoose").Schema<LgpdAudit, import("mongoose").Model<LgpdAudit, any, any, any, Document<unknown, any, LgpdAudit, any, {}> & LgpdAudit & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LgpdAudit, Document<unknown, {}, import("mongoose").FlatRecord<LgpdAudit>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LgpdAudit> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
