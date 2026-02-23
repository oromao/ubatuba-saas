import { Document, Types } from 'mongoose';
import { LineGeometry } from '../../../common/utils/geo';
export declare class PgvFace {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    code: string;
    logradouroId?: Types.ObjectId;
    zoneId?: Types.ObjectId;
    zonaValorId?: Types.ObjectId;
    landValuePerSqm: number;
    valorTerrenoM2?: number;
    metadados?: {
        lado?: string;
        trecho?: string;
        observacoes?: string;
    };
    geometry: LineGeometry;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type PgvFaceDocument = PgvFace & Document;
export declare const PgvFaceSchema: import("mongoose").Schema<PgvFace, import("mongoose").Model<PgvFace, any, any, any, Document<unknown, any, PgvFace, any, {}> & PgvFace & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvFace, Document<unknown, {}, import("mongoose").FlatRecord<PgvFace>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvFace> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
