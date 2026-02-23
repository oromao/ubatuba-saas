import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';
type EnderecoPrincipal = {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
};
export declare class Parcel {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    sqlu: string;
    inscricaoImobiliaria?: string;
    inscription?: string;
    enderecoPrincipal?: EnderecoPrincipal;
    mainAddress?: string;
    statusCadastral?: 'ATIVO' | 'INATIVO' | 'CONFLITO';
    status?: string;
    observacoes?: string;
    workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';
    pendingIssues?: string[];
    logradouroId?: Types.ObjectId;
    zoneId?: Types.ObjectId;
    faceId?: Types.ObjectId;
    areaTerreno?: number;
    area?: number;
    geometry: PolygonGeometry;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type ParcelDocument = Parcel & Document;
export declare const ParcelSchema: import("mongoose").Schema<Parcel, import("mongoose").Model<Parcel, any, any, any, Document<unknown, any, Parcel, any, {}> & Parcel & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Parcel, Document<unknown, {}, import("mongoose").FlatRecord<Parcel>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Parcel> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
