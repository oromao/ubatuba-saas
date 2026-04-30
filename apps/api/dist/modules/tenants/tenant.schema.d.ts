import { Document } from 'mongoose';
export interface Endereco {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    telefone?: string;
    email?: string;
    website?: string;
}
export interface Aliquotas {
    iptuResidencial?: number;
    iptuComercial?: number;
    iptuIndustrial?: number;
    iptuTerritorial?: number;
    itbi?: number;
    taxaColetaLixo?: number;
    taxaIluminacao?: number;
}
export interface Lei {
    numero: string;
    ano: number;
    titulo: string;
    descricao?: string;
    tipo?: 'LEI_MUNICIPAL' | 'DECRETO' | 'PORTARIA' | 'INSTRUCAO_NORMATIVA';
}
export interface ModulosHabilitados {
    ctm?: boolean;
    pgv?: boolean;
    reurb?: boolean;
    fiscalizacao?: boolean;
    alvaraObras?: boolean;
    alvaraFuncionamento?: boolean;
    cemiterio?: boolean;
    citizen156?: boolean;
    obrasPublicas?: boolean;
    observatorio?: boolean;
}
export interface MunicipalConfig {
    brasao?: string;
    logo?: string;
    cnpjMunicipio?: string;
    ibgeCode?: string;
    uf?: string;
    endereco?: Endereco;
    aliquotasPadrao?: Aliquotas;
    leis?: Lei[];
    modulosHabilitados?: ModulosHabilitados;
    pgvPadrao?: {
        valorBaseTerrenoM2?: number;
        valorBaseConstrucaoM2?: number;
        anoBase?: number;
    };
    configuracaoRegional?: {
        timezone?: string;
        locale?: string;
    };
}
export declare class Tenant {
    name: string;
    slug: string;
    municipalConfig?: MunicipalConfig;
}
export type TenantDocument = Tenant & Document;
export declare const TenantSchema: import("mongoose").Schema<Tenant, import("mongoose").Model<Tenant, any, any, any, Document<unknown, any, Tenant, any, {}> & Tenant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tenant, Document<unknown, {}, import("mongoose").FlatRecord<Tenant>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Tenant> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
