import { Document, Types } from 'mongoose';
export declare class PgvValuation {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    versionId: Types.ObjectId;
    landValuePerSqm: number;
    landFactor: number;
    constructionValuePerSqm: number;
    constructionFactor: number;
    landValue: number;
    constructionValue: number;
    totalValue: number;
    breakdown?: Record<string, unknown>;
    createdBy?: Types.ObjectId;
}
export type PgvValuationDocument = PgvValuation & Document;
export declare const PgvValuationSchema: import("mongoose").Schema<PgvValuation, import("mongoose").Model<PgvValuation, any, any, any, Document<unknown, any, PgvValuation, any, {}> & PgvValuation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvValuation, Document<unknown, {}, import("mongoose").FlatRecord<PgvValuation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvValuation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
