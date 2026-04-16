import { Document } from 'mongoose';
export type VistoriaDocument = Vistoria & Document;
export declare class Vistoria {
    parcelId: string;
    tipo: string;
    data: Date;
    observacoes: string;
    status: string;
    fotos: string[];
    historico: {
        status: string;
        observacao: string;
        userId: string;
        timestamp: Date;
    }[];
    tenantId: string;
    operadorId: string;
}
export declare const VistoriaSchema: import("mongoose").Schema<Vistoria, import("mongoose").Model<Vistoria, any, any, any, Document<unknown, any, Vistoria, any, {}> & Vistoria & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vistoria, Document<unknown, {}, import("mongoose").FlatRecord<Vistoria>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Vistoria> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
