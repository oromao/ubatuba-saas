declare class RequerenteDto {
    nome: string;
    documento: string;
    endereco?: string;
}
declare class ChildDefinitionDto {
    sqlu: string;
    geometry: any;
    mainAddress?: string;
    inscricaoImobiliaria?: string;
}
export declare class CreateSubdivisionDto {
    parentParcelId: string;
    tipo?: string;
    numeroProcesso?: string;
    motivo?: string;
    observacoes?: string;
    requerente?: RequerenteDto;
    childDefinitions: ChildDefinitionDto[];
}
export {};
