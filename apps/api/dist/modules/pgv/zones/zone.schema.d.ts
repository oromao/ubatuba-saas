import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';
export declare class PgvZone {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    code: string;
    name: string;
    nome?: string;
    description?: string;
    descricao?: string;
    baseLandValue: number;
    valorBaseTerrenoM2?: number;
    baseConstructionValue: number;
    valorBaseConstrucaoM2?: number;
    geometry: PolygonGeometry;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type PgvZoneDocument = PgvZone & Document;
export declare const PgvZoneSchema: import("mongoose").Schema<PgvZone, import("mongoose").Model<PgvZone, any, any, any, Document<unknown, any, PgvZone, any, {}> & PgvZone & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvZone, Document<unknown, {}, import("mongoose").FlatRecord<PgvZone>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvZone> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
