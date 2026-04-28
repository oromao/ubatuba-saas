import { Document, Types } from 'mongoose';
import { LineGeometry } from '../../../common/utils/geo';
export declare class Logradouro {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    nome?: string;
    type: string;
    tipo?: string;
    code: string;
    codigo?: string;
    geometry?: LineGeometry;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type LogradouroDocument = Logradouro & Document;
export declare const LogradouroSchema: import("mongoose").Schema<Logradouro, import("mongoose").Model<Logradouro, any, any, any, Document<unknown, any, Logradouro, any, {}> & Logradouro & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Logradouro, Document<unknown, {}, import("mongoose").FlatRecord<Logradouro>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Logradouro> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
