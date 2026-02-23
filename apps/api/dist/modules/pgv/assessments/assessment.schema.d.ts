import { Document, Types } from 'mongoose';
export declare class PgvAssessment {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    versao: string;
    componentes?: Record<string, unknown>;
    memoriaCalculo?: Record<string, unknown>;
    valorVenalFinal: number;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type PgvAssessmentDocument = PgvAssessment & Document;
export declare const PgvAssessmentSchema: import("mongoose").Schema<PgvAssessment, import("mongoose").Model<PgvAssessment, any, any, any, Document<unknown, any, PgvAssessment, any, {}> & PgvAssessment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvAssessment, Document<unknown, {}, import("mongoose").FlatRecord<PgvAssessment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvAssessment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
