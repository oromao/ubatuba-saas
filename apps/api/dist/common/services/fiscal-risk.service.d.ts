export interface FiscalRiskScore {
    parcelId: string;
    sqlu: string;
    riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
    score: number;
    factors: {
        iptuStatus: number;
        noValuation: number;
        conflictStatus: number;
        recentInspection: number;
        areaDiscrepancy: number;
        zoneChange: number;
    };
    recommendation: string;
}
export declare class FiscalRiskService {
    calculateRisk(params: {
        parcelId: string;
        sqlu: string;
        statusIPTU?: string;
        valorVenalTotal?: number;
        valuationTotalValue?: number;
        statusCadastral?: string;
        workflowStatus?: string;
        lastInspectionDate?: string;
        areaTerreno?: number;
        areaCartografica?: number;
        zoneamento?: string;
        zoneUpdatedAt?: string;
        iptuLancado?: number;
        iptuPago?: number;
    }): FiscalRiskScore;
    rankByRisk(parcels: Array<Parameters<FiscalRiskService['calculateRisk']>[0]>): FiscalRiskScore[];
}
