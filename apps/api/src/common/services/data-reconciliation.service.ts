import { Injectable } from '@nestjs/common';

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

@Injectable()
export class DataReconciliationService {
  /**
   * Compare parcel IPTU data with PGV valuations.
   * In production, this would query the database. Here we provide the utility.
   */
  compareParcelVsValuation(
    parcels: Array<{ id: string; sqlu: string; valorVenalTotal?: number }>,
    valuations: Array<{ parcelId: string; totalValue: number }>,
  ): DataComparisonResult {
    const valuationMap = new Map(valuations.map((v) => [v.parcelId, v.totalValue]));

    let parcelsWithIptu = 0;
    const discrepancies: DataComparisonResult['discrepancies'] = [];

    for (const parcel of parcels) {
      if (parcel.valorVenalTotal !== undefined) {
        parcelsWithIptu++;
        const valuationValue = valuationMap.get(parcel.id);
        if (valuationValue !== undefined && Math.abs(parcel.valorVenalTotal - valuationValue) > 1) {
          discrepancies.push({
            parcelId: parcel.id,
            sqlu: parcel.sqlu,
            parcelVenalTotal: parcel.valorVenalTotal,
            valuationTotalValue: valuationValue,
            difference: parcel.valorVenalTotal - valuationValue,
          });
        }
      }
    }

    return {
      totalParcels: parcels.length,
      parcelsWithIptu,
      parcelsWithoutIptu: parcels.length - parcelsWithIptu,
      totalValuations: valuations.length,
      matchRate: parcels.length > 0
        ? Math.round(((parcels.length - discrepancies.length) / parcels.length) * 10000) / 100
        : 0,
      discrepancies,
    };
  }
}
