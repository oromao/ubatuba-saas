import { Document, Types } from 'mongoose';
export declare class PgvVersion {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    year: number;
    isActive: boolean;
    createdBy?: Types.ObjectId;
}
export type PgvVersionDocument = PgvVersion & Document;
export declare const PgvVersionSchema: import("mongoose").Schema<PgvVersion, import("mongoose").Model<PgvVersion, any, any, any, Document<unknown, any, PgvVersion, any, {}> & PgvVersion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvVersion, Document<unknown, {}, import("mongoose").FlatRecord<PgvVersion>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvVersion> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
