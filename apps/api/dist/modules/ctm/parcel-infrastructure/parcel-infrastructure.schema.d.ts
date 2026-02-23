import { Document, Types } from 'mongoose';
export declare class ParcelInfrastructure {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    water?: boolean;
    agua?: boolean;
    sewage?: boolean;
    esgoto?: boolean;
    electricity?: boolean;
    energia?: boolean;
    pavingType?: string;
    pavimentacao?: string;
    publicLighting?: boolean;
    iluminacao?: boolean;
    garbageCollection?: boolean;
    coleta?: boolean;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ParcelInfrastructureDocument = ParcelInfrastructure & Document;
export declare const ParcelInfrastructureSchema: import("mongoose").Schema<ParcelInfrastructure, import("mongoose").Model<ParcelInfrastructure, any, any, any, Document<unknown, any, ParcelInfrastructure, any, {}> & ParcelInfrastructure & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParcelInfrastructure, Document<unknown, {}, import("mongoose").FlatRecord<ParcelInfrastructure>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ParcelInfrastructure> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
