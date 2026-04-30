jest.mock("geojson-vt", () => require("./helpers/geojson-vt-mock.cjs"));
import { Test, TestingModule } from '@nestjs/testing';
import { ObservatoryService } from '../src/modules/observatory/observatory.service';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ValuationsService } from '../src/modules/pgv/valuations/valuations.service';
import { MonitoringService } from '../src/modules/monitoring/monitoring.service';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { CacheService } from '../src/modules/shared/cache.service';

const TID = '507f1f77bcf86cd799439011';

const mockParcelsService = {
  list: jest.fn().mockResolvedValue([]),
};

const mockValuationsService = {
  list: jest.fn().mockResolvedValue([]),
};

const mockMonitoringService = {
  list: jest.fn().mockResolvedValue([]),
};

const mockProjectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
};

const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn(),
};

describe('ObservatoryService (T10-OBSERVATORIO)', () => {
  let service: ObservatoryService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        ObservatoryService,
        { provide: ParcelsService, useValue: mockParcelsService },
        { provide: ValuationsService, useValue: mockValuationsService },
        { provide: MonitoringService, useValue: mockMonitoringService },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();
    service = moduleRef.get<ObservatoryService>(ObservatoryService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('marketOverview', () => {
    it('should return empty overview when no data', async () => {
      const result: any = await service.marketOverview(TID);
      expect(result).toBeDefined();
      expect(result.summary.parcelas).toBe(0);
      expect(result.summary.avaliacoes).toBe(0);
      expect(result.indicators).toHaveLength(5);
    });

    it('should aggregate parcel and valuation data', async () => {
      mockParcelsService.list.mockResolvedValue([
        { id: 'p1', zoneId: 'z1', workflowStatus: 'APROVADA', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua A' } },
        { id: 'p2', zoneId: 'z1', workflowStatus: 'PENDENTE', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua B' } },
        { id: 'p3', zoneId: 'z2', workflowStatus: 'CONFLITO', enderecoPrincipal: { bairro: 'Litoral', logradouro: 'Rua C' } },
      ]);
      mockValuationsService.list.mockResolvedValue([
        { parcelId: 'p1', totalValue: 200000, landValue: 80000, constructionValue: 120000 },
        { parcelId: 'p2', totalValue: 150000, landValue: 60000, constructionValue: 90000 },
      ]);

      const result: any = await service.marketOverview(TID);
      expect(result.summary.parcelas).toBe(3);
      expect(result.summary.avaliacoes).toBe(2);
      expect(result.coverage.valuationCoverage).toBeCloseTo(66.67, 1);
      expect(result.concentration).toHaveLength(2);
    });

    it('should detect pending and conflict parcels', async () => {
      mockParcelsService.list.mockResolvedValue([
        { id: 'p1', workflowStatus: 'PENDENTE' },
        { id: 'p2', workflowStatus: 'CONFLITO' },
        { id: 'p3', workflowStatus: 'APROVADA' },
        { id: 'p4', workflowStatus: 'REPROVADA' },
      ]);
      mockValuationsService.list.mockResolvedValue([]);

      const result: any = await service.marketOverview(TID);
      expect(result.coverage.pendingRate).toBe(25); // 1/4
      expect(result.coverage.conflictRate).toBe(50); // 2/4 (CONFLITO + REPROVADA)
    });

    it('should include monitoring events', async () => {
      mockParcelsService.list.mockResolvedValue([{ id: 'p1', workflowStatus: 'APROVADA' }]);
      mockValuationsService.list.mockResolvedValue([]);
      mockMonitoringService.list.mockResolvedValue([
        { stage: 'TRIAGEM', severity: 'ALTA', createdAt: new Date().toISOString() },
        { stage: 'FISCALIZACAO', severity: 'CRITICA', createdAt: new Date().toISOString() },
      ]);

      const result: any = await service.marketOverview(TID);
      expect(result.monitoringSummary.total).toBe(2);
      expect(result.monitoringSummary.altaCriticidade).toBe(2);
    });

    it('should return operational narrative', async () => {
      mockParcelsService.list.mockResolvedValue([{ id: 'p1', workflowStatus: 'APROVADA', zoneId: 'z1' }]);
      mockValuationsService.list.mockResolvedValue([{ parcelId: 'p1', totalValue: 100000 }]);

      const result: any = await service.marketOverview(TID);
      expect(result.operationalNarrative.arrecadacao).toContain('Base monetaria');
      expect(result.indicators[0].value).toBe(1);
    });

    it('should use cache when available', async () => {
      const cached = { summary: { parcelas: 99 } };
      mockCacheService.get.mockResolvedValue(cached);

      const result: any = await service.marketOverview(TID);
      expect(result.summary.parcelas).toBe(99);
      expect(mockParcelsService.list).not.toHaveBeenCalled();
    });
  });

  describe('exportMarketCsv', () => {
    it('should generate CSV export successfully', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockParcelsService.list.mockResolvedValue([
        { id: 'p1', zoneId: 'z1', workflowStatus: 'APROVADA', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua A' } },
        { id: 'p2', zoneId: 'z1', workflowStatus: 'PENDENTE', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua B' } },
      ]);
      mockValuationsService.list.mockResolvedValue([
        { parcelId: 'p1', totalValue: 200000, landValue: 80000, constructionValue: 120000, createdAt: new Date().toISOString() },
      ]);
      mockMonitoringService.list.mockResolvedValue([]);

      const result: any = await service.exportMarketCsv(TID);
      expect(result).toBeDefined();
      expect(result.fileName).toBeDefined();
    });
  });
});
