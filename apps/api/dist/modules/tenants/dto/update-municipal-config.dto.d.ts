export declare class UpdateMunicipalConfigDto {
    brasao?: string;
    logo?: string;
    cnpjMunicipio?: string;
    ibgeCode?: string;
    uf?: string;
    endereco?: Record<string, string>;
    aliquotasPadrao?: Record<string, number>;
    leis?: Array<Record<string, any>>;
    modulosHabilitados?: Record<string, boolean>;
    pgvPadrao?: Record<string, number>;
    configuracaoRegional?: Record<string, string>;
}
