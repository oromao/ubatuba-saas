import { Document, Types } from 'mongoose';
export type FactorCategory = 'LAND' | 'CONSTRUCTION';
export declare class PgvFactor {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    category: FactorCategory;
    key: string;
    label: string;
    value: number;
    description?: string;
    isDefault: boolean;
    createdBy?: Types.ObjectId;
}
export type PgvFactorDocument = PgvFactor & Document;
export declare const PgvFactorSchema: import("mongoose").Schema<PgvFactor, import("mongoose").Model<PgvFactor, any, any, any, Document<unknown, any, PgvFactor, any, {}> & PgvFactor & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvFactor, Document<unknown, {}, import("mongoose").FlatRecord<PgvFactor>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvFactor> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
