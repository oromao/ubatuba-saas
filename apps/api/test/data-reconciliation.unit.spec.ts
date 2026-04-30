import { Test, TestingModule } from '@nestjs/testing';
import { DataReconciliationService } from '../src/common/services/data-reconciliation.service';

describe('DataReconciliationService (T2-DATA-RECONCILE)', () => {
  let service: DataReconciliationService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DataReconciliationService],
    }).compile();
    service = moduleRef.get<DataReconciliationService>(DataReconciliationService);
  });

  it('should compare parcels with matching valuations', () => {
    const parcels = [
      { id: 'p1', sqlu: '001', valorVenalTotal: 200000 },
      { id: 'p2', sqlu: '002', valorVenalTotal: 150000 },
    ];
    const valuations = [
      { parcelId: 'p1', totalValue: 200000 },
      { parcelId: 'p2', totalValue: 150000 },
    ];

    const result = service.compareParcelVsValuation(parcels, valuations);
    expect(result.totalParcels).toBe(2);
    expect(result.parcelsWithIptu).toBe(2);
    expect(result.matchRate).toBe(100);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('should detect discrepancies between parcel and valuation', () => {
    const parcels = [
      { id: 'p1', sqlu: '001', valorVenalTotal: 200000 },
      { id: 'p2', sqlu: '002', valorVenalTotal: 100000 },
    ];
    const valuations = [
      { parcelId: 'p1', totalValue: 200000 },
      { parcelId: 'p2', totalValue: 150000 }, // discrepancy: 50k
    ];

    const result = service.compareParcelVsValuation(parcels, valuations);
    expect(result.discrepancies).toHaveLength(1);
    expect(result.discrepancies[0].sqlu).toBe('002');
    expect(result.discrepancies[0].difference).toBe(-50000);
    expect(result.matchRate).toBe(50);
  });

  it('should report parcels without IPTU', () => {
    const parcels = [
      { id: 'p1', sqlu: '001', valorVenalTotal: 200000 },
      { id: 'p2', sqlu: '002' }, // no valorVenalTotal
      { id: 'p3', sqlu: '003' }, // no valorVenalTotal
    ];
    const valuations = [
      { parcelId: 'p1', totalValue: 200000 },
    ];

    const result = service.compareParcelVsValuation(parcels, valuations);
    expect(result.parcelsWithoutIptu).toBe(2);
    expect(result.totalValuations).toBe(1);
  });

  it('should handle empty input', () => {
    const result = service.compareParcelVsValuation([], []);
    expect(result.totalParcels).toBe(0);
    expect(result.matchRate).toBe(0);
  });
});
