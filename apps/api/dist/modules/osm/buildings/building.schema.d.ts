import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';
export declare class Building {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    osmId: number;
    name?: string;
    nome?: string;
    building?: string;
    tipo?: string;
    geometry: PolygonGeometry;
}
export type BuildingDocument = Building & Document;
export declare const BuildingSchema: import("mongoose").Schema<Building, import("mongoose").Model<Building, any, any, any, Document<unknown, any, Building, any, {}> & Building & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Building, Document<unknown, {}, import("mongoose").FlatRecord<Building>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Building> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
