declare class RequerenteDto {
    nome: string;
    documento: string;
    endereco?: string;
}
export declare class UpdateSubdivisionDto {
    motivo?: string;
    observacoes?: string;
    status?: string;
    requerente?: RequerenteDto;
}
export {};
