import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';
export type SubdivisionType = 'DESMEMBRAMENTO' | 'LOTEAMENTO' | 'REMEMBRAMENTO';
export type SubdivisionStatus = 'RASCUNHO' | 'PROTOCOLADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
export interface ChildDefinition {
    sqlu: string;
    geometry: PolygonGeometry;
    area: number;
    areaPercent: number;
    mainAddress?: string;
    inscricaoImobiliaria?: string;
}
export declare class ParcelSubdivision {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parentParcelId: Types.ObjectId;
    tipo: SubdivisionType;
    status: SubdivisionStatus;
    numeroProcesso?: string;
    motivo?: string;
    observacoes?: string;
    requerente?: {
        nome: string;
        documento: string;
        endereco?: string;
    };
    childDefinitions: ChildDefinition[];
    childParcelIds?: Types.ObjectId[];
    documents?: Array<{
        tipo: string;
        url: string;
        nome: string;
    }>;
    aprovadoPor?: Types.ObjectId;
    aprovadoEm?: Date;
    rejeitadoPor?: Types.ObjectId;
    rejeitadoEm?: Date;
    motivoRejeicao?: string;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ParcelSubdivisionDocument = ParcelSubdivision & Document;
export declare const ParcelSubdivisionSchema: import("mongoose").Schema<ParcelSubdivision, import("mongoose").Model<ParcelSubdivision, any, any, any, Document<unknown, any, ParcelSubdivision, any, {}> & ParcelSubdivision & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ParcelSubdivision, Document<unknown, {}, import("mongoose").FlatRecord<ParcelSubdivision>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ParcelSubdivision> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
