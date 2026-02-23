type FactorItem = {
    tipo: string;
    chave: string;
    valorMultiplicador: number;
};
type ConstructionValueItem = {
    uso: string;
    padraoConstrutivo: string;
    valorM2: number;
};
export declare class UpdateFactorSetDto {
    projectId?: string;
    fatoresTerreno?: FactorItem[];
    fatoresConstrucao?: FactorItem[];
    valoresConstrucaoM2?: ConstructionValueItem[];
}
export {};
