import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IptuService } from '../src/modules/pgv/iptu/iptu.service';
import { ValuationsService } from '../src/modules/pgv/valuations/valuations.service';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { Parcel, ParcelDocument } from '../src/modules/ctm/parcels/parcel.schema';
import { PgvZone, PgvZoneDocument } from '../src/modules/pgv/zones/zone.schema';
import { PgvValuation, PgvValuationDocument } from '../src/modules/pgv/valuations/valuation.schema';

const mockValuationResult = {
  parcelId: 'test-parcel-1',
  landValue: 80000,
  constructionValue: 120000,
  totalValue: 200000,
  landValuePerSqm: 400,
  landFactor: 1.0,
  constructionValuePerSqm: 800,
  constructionFactor: 1.0,
};

const mockValuationsService = {
  calculate: jest.fn().mockResolvedValue(mockValuationResult),
};

const mockTenantsService = {
  getAliquotasPadrao: jest.fn().mockResolvedValue({}),
};

const mockParcel = {
  _id: '507f1f77bcf86cd799439011',
  sqlu: '12345',
  inscription: 'INS-001',
  inscricaoImobiliaria: 'IMO-001',
  zoneamento: 'ZR1',
  zoneId: '507f1f77bcf86cd799439099',
};

const mockParcelModel = {
  findById: jest.fn(),
  find: jest.fn(),
};

const mockZoneModel = {
  findById: jest.fn(),
};

const mockValuationModel = {};

describe('IptuService - Unit Tests (T8-TRIB-IPTU)', () => {
  let service: IptuService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        IptuService,
        { provide: ValuationsService, useValue: mockValuationsService },
        { provide: TenantsService, useValue: mockTenantsService },
        { provide: getModelToken(Parcel.name), useValue: mockParcelModel },
        { provide: getModelToken(PgvZone.name), useValue: mockZoneModel },
        { provide: getModelToken(PgvValuation.name), useValue: mockValuationModel },
      ],
    }).compile();

    service = module.get<IptuService>(IptuService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // IPTU Single Parcel Calculation
  // ==========================================================================

  describe('calculateForParcel', () => {
    it('should compute IPTU = venal × aliquota for a parcel', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcel),
      });
      mockZoneModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439099',
          code: 'ZR1',
          name: 'Zona Residencial 1',
          aliquotaIptu: 0.005,
        }),
      });

      const result = await service.calculateForParcel({
        parcelId: '507f1f77bcf86cd799439011',
        tenantId: '507f1f77bcf86cd799439012',
        projectId: '507f1f77bcf86cd799439013',
        year: 2026,
      });

      expect(result.parcelId).toBe('507f1f77bcf86cd799439011');
      expect(result.sqlu).toBe('12345');
      expect(result.valorVenalTotal).toBe(200000);
      expect(result.aliquotaIptu).toBe(0.005);
      expect(result.iptuDevido).toBe(1000); // 200000 * 0.005
      expect(result.anoExercicio).toBe(2026);
      expect(result.zoneCode).toBe('ZR1');
    });

    it('should use default aliquota 0.5% when zone has no aliquota', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockParcel, zoneId: null }),
      });

      mockValuationsService.calculate.mockResolvedValue({
        ...mockValuationResult,
        totalValue: 150000,
      });

      const result = await service.calculateForParcel({
        parcelId: '507f1f77bcf86cd799439011',
        tenantId: 't1',
        projectId: 'p1',
      });

      expect(result.aliquotaIptu).toBe(0.005);
      expect(result.iptuDevido).toBe(750); // 150000 * 0.005
    });

    it('should compute correct IPTU for different aliquota values', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcel),
      });
      mockZoneModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439099',
          code: 'ZC1',
          name: 'Zona Comercial 1',
          aliquotaIptu: 0.015,
        }),
      });

      mockValuationsService.calculate.mockResolvedValue({
        ...mockValuationResult,
        totalValue: 500000,
      });

      const result = await service.calculateForParcel({
        parcelId: '507f1f77bcf86cd799439011',
        tenantId: 't1',
        projectId: 'p1',
        year: 2026,
      });

      expect(result.aliquotaIptu).toBe(0.015);
      expect(result.iptuDevido).toBe(7500); // 500000 * 0.015
    });

    it('should throw for non-existent parcel', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.calculateForParcel({
          parcelId: 'nonexistent',
          tenantId: 't1',
          projectId: 'p1',
        }),
      ).rejects.toThrow('not found');
    });

    it('should call PGV valuations service for venal value', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcel),
      });
      mockZoneModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439099',
          code: 'ZR1',
          aliquotaIptu: 0.005,
        }),
      });

      await service.calculateForParcel({
        parcelId: '507f1f77bcf86cd799439011',
        tenantId: 't1',
        projectId: 'p1',
      });

      expect(mockValuationsService.calculate).toHaveBeenCalledTimes(1);
      expect(mockValuationsService.calculate).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({
          parcelId: '507f1f77bcf86cd799439011',
          projectId: 'p1',
          persist: false,
        }),
      );
    });
  });

  // ==========================================================================
  // IPTU Aliquota Query
  // ==========================================================================

  describe('getAliquota', () => {
    it('should return zone aliquota when parcel has zoneId', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcel),
      });
      mockZoneModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439099',
          code: 'ZR1',
          name: 'Zona Residencial 1',
          aliquotaIptu: 0.008,
        }),
      });

      const result = await service.getAliquota('507f1f77bcf86cd799439011');

      expect(result.aliquota).toBe(0.008);
      expect(result.zoneCode).toBe('ZR1');
      expect(result.zoneName).toBe('Zona Residencial 1');
    });

    it('should return default 0.5% when parcel has no zone', async () => {
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockParcel, zoneId: null }),
      });

      const result = await service.getAliquota('507f1f77bcf86cd799439011');

      expect(result.aliquota).toBe(0.005);
    });
  });

  // ==========================================================================
  // IPTU Batch Calculation
  // ==========================================================================

  describe('calculateBatch', () => {
    it('should compute IPTU for multiple parcels', async () => {
      const mockParcels = [
        { _id: 'a1', sqlu: '001', zoneId: 'z1' },
        { _id: 'a2', sqlu: '002', zoneId: 'z1' },
        { _id: 'a3', sqlu: '003', zoneId: null },
      ];

      mockParcelModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcels),
      });

      // Mock individual parcel lookups for calculateForParcel
      mockParcelModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParcel),
      });
      mockZoneModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'z1',
          code: 'ZR1',
          aliquotaIptu: 0.005,
        }),
      });
      mockValuationsService.calculate.mockResolvedValue({
        ...mockValuationResult,
        totalValue: 100000,
      });

      const result = await service.calculateBatch('t1', 'p1', 2026);

      expect(result.anoExercicio).toBe(2026);
      expect(result.totalParcelas).toBe(3);
      expect(result.totalIptu).toBe(1500); // 3 * (100000 * 0.005) = 3 * 500
    });
  });
});
