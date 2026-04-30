export interface DataComparisonResult {
    totalParcels: number;
    parcelsWithIptu: number;
    parcelsWithoutIptu: number;
    totalValuations: number;
    matchRate: number;
    discrepancies: Array<{
        parcelId: string;
        sqlu: string;
        parcelVenalTotal?: number;
        valuationTotalValue?: number;
        difference?: number;
    }>;
}
export declare class DataReconciliationService {
    compareParcelVsValuation(parcels: Array<{
        id: string;
        sqlu: string;
        valorVenalTotal?: number;
    }>, valuations: Array<{
        parcelId: string;
        totalValue: number;
    }>): DataComparisonResult;
}
