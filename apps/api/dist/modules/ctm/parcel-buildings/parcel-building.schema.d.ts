import { Document, Types } from 'mongoose';
export declare class ParcelBuilding {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    useType?: string;
    constructionStandard?: string;
    builtArea?: number;
    floors?: number;
    constructionYear?: number;
    occupancyType?: string;
    uso?: string;
    padraoConstrutivo?: string;
    areaConstruida?: number;
    pavimentos?: number;
    anoConstrucao?: number;
    tipoOcupacao?: string;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ParcelBuildingDocument = ParcelBuilding & Document;
export declare const ParcelBuildingSchema: import("mongoose").Schema<ParcelBuilding, import("mongoose").Model<ParcelBuilding, any, any, any, Document<unknown, any, ParcelBuilding, any, {}> & ParcelBuilding & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParcelBuilding, Document<unknown, {}, import("mongoose").FlatRecord<ParcelBuilding>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ParcelBuilding> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
