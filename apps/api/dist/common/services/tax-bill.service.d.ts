export interface TaxBillInstallment {
    numero: number;
    vencimento: string;
    valor: number;
    status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}
export interface TaxBill {
    id: string;
    parcelId: string;
    sqlu: string;
    contribuinte: string;
    anoExercicio: number;
    valorVenalTotal: number;
    aliquotaIptu: number;
    iptuTotal: number;
    parcelas: TaxBillInstallment[];
    descontoPagamentoUnico?: number;
}
export declare class TaxBillService {
    generateTaxBill(params: {
        parcelId: string;
        sqlu: string;
        contribuinte: string;
        anoExercicio: number;
        valorVenalTotal: number;
        aliquotaIptu: number;
        numeroParcelas?: number;
    }): TaxBill;
    calculateCollectionSummary(bills: TaxBill[]): {
        totalLancado: number;
        totalParcelas: number;
        mediaValorVenal: number;
        inadimplenciaEstimada?: number;
    };
    getDefaultParcelas(iptuTotal: number): number;
}
