import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';
export type SourceType = 'DEMO' | 'DEMO_EXTERNAL' | 'OFFICIAL_SAMPLE' | 'MANUAL' | 'SHAPEFILE' | 'GEOJSON' | 'CSV_ENRICHMENT' | 'OFFICIAL_IMPORT';
export type ValidationStatus = 'VALID' | 'INVALID' | 'PENDING' | 'WARNING';
export type IptuStatus = 'QUITADO' | 'PARCELADO' | 'INADIMPLENTE' | 'ISENTO' | 'EXIGIVEL' | 'NAO_CADASTRADO';
type EnderecoPrincipal = {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
};
export type OriginType = 'ORIGINAL' | 'SUBDIVIDED' | 'MERGED';
export declare class Parcel {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    sqlu: string;
    inscricaoImobiliaria?: string;
    inscription?: string;
    enderecoPrincipal?: EnderecoPrincipal;
    mainAddress?: string;
    codigoImovel?: string;
    setor?: string;
    quadra?: string;
    lote?: string;
    cep?: string;
    zoneamento?: string;
    areaTerreno?: number;
    area?: number;
    areaConstruida?: number;
    areaCartografica?: number;
    valorVenalTerreno?: number;
    valorVenalConstrucao?: number;
    valorVenalTotal?: number;
    iptuLancado?: number;
    iptuPago?: number;
    iptuEmAberto?: number;
    statusIPTU?: IptuStatus;
    exercicioIPTU?: number;
    proprietarioNome?: string;
    proprietarioDocumento?: string;
    sourceType?: SourceType;
    municipalityName?: string;
    municipalityCode?: string;
    importBatchId?: string;
    isOfficial?: boolean;
    active?: boolean;
    validationStatus?: ValidationStatus;
    validationErrors?: string[];
    centroid?: {
        type: string;
        coordinates: [number, number];
    };
    bbox?: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    geometry: PolygonGeometry;
    rawProperties?: Record<string, any>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    statusCadastral?: 'ATIVO' | 'INATIVO' | 'CONFLITO';
    status?: string;
    observacoes?: string;
    workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';
    pendingIssues?: string[];
    logradouroId?: Types.ObjectId;
    zoneId?: Types.ObjectId;
    faceId?: Types.ObjectId;
    parentParcelId?: Types.ObjectId;
    subdivisionRequestId?: Types.ObjectId;
    originType?: OriginType;
    subdivisionDate?: Date;
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
