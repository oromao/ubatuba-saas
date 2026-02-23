import { Document, Types } from 'mongoose';
export declare class ParcelSocioeconomic {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    incomeBracket?: string;
    faixaRenda?: string;
    residents?: number;
    moradores?: number;
    vulnerabilityIndicator?: string;
    vulnerabilidade?: string;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ParcelSocioeconomicDocument = ParcelSocioeconomic & Document;
export declare const ParcelSocioeconomicSchema: import("mongoose").Schema<ParcelSocioeconomic, import("mongoose").Model<ParcelSocioeconomic, any, any, any, Document<unknown, any, ParcelSocioeconomic, any, {}> & ParcelSocioeconomic & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParcelSocioeconomic, Document<unknown, {}, import("mongoose").FlatRecord<ParcelSocioeconomic>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ParcelSocioeconomic> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
