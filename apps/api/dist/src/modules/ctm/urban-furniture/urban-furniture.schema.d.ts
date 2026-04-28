import { Document, Types } from 'mongoose';
import { PointGeometry } from '../../../common/utils/geo';
export declare class UrbanFurniture {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    type: string;
    tipo?: string;
    location: PointGeometry;
    geometry?: PointGeometry;
    condition?: string;
    estadoConservacao?: string;
    notes?: string;
    observacao?: string;
    photoUrl?: string;
    fotoUrl?: string;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type UrbanFurnitureDocument = UrbanFurniture & Document;
export declare const UrbanFurnitureSchema: import("mongoose").Schema<UrbanFurniture, import("mongoose").Model<UrbanFurniture, any, any, any, Document<unknown, any, UrbanFurniture, any, {}> & UrbanFurniture & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UrbanFurniture, Document<unknown, {}, import("mongoose").FlatRecord<UrbanFurniture>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UrbanFurniture> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
