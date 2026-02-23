import { Document, Types } from 'mongoose';
type PgvFactorItem = {
    tipo: string;
    chave: string;
    valorMultiplicador: number;
};
type PgvConstructionValue = {
    uso: string;
    padraoConstrutivo: string;
    valorM2: number;
};
export declare class PgvFactorSet {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    fatoresTerreno: PgvFactorItem[];
    fatoresConstrucao: PgvFactorItem[];
    valoresConstrucaoM2: PgvConstructionValue[];
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type PgvFactorSetDocument = PgvFactorSet & Document;
export declare const PgvFactorSetSchema: import("mongoose").Schema<PgvFactorSet, import("mongoose").Model<PgvFactorSet, any, any, any, Document<unknown, any, PgvFactorSet, any, {}> & PgvFactorSet & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvFactorSet, Document<unknown, {}, import("mongoose").FlatRecord<PgvFactorSet>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvFactorSet> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
