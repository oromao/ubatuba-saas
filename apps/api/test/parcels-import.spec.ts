import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ImportBatchRepository } from '../src/modules/ctm/parcels/import-batch.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { LogradourosService } from '../src/modules/ctm/logradouros/logradouros.service';
import { ParcelAuditRepository } from '../src/modules/ctm/parcels/parcel-audit.repository';

describe('ParcelsService Import Tests', () => {
  let service: ParcelsService;
  let repository: Partial<ParcelsRepository>;
  let importBatchRepository: Partial<ImportBatchRepository>;

  const mockRepository = {
    list: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findBySqlu: jest.fn().mockResolvedValue(null),
    findByInscription: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'new-parcel-id', sqlu: 'TEST-001' }),
    update: jest.fn().mockResolvedValue({ id: 'updated-id' }),
    delete: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockImportBatchRepository = {
    create: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000004', status: 'PROCESSING' }),
    update: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000004', status: 'COMPLETED' }),
  };

  const mockProjectsService = {
    resolveProjectId: jest.fn().mockResolvedValue('66f1f77a67e30f9f62000002'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelsService,
        { provide: ParcelsRepository, useValue: mockRepository },
        { provide: ImportBatchRepository, useValue: mockImportBatchRepository },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ParcelBuildingsService, useValue: {} },
        { provide: ParcelSocioeconomicService, useValue: {} },
        { provide: ParcelInfrastructureService, useValue: {} },
        { provide: LogradourosService, useValue: {} },
        { provide: ParcelAuditRepository, useValue: { create: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<ParcelsService>(ParcelsService);
    repository = module.get(ParcelsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importGeojson', () => {
    it('should import valid GeoJSON with all required fields', async () => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: '1',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-45.0, -23.0],
                [-45.0, -23.01],
                [-45.01, -23.01],
                [-45.01, -23.0],
                [-45.0, -23.0],
              ]],
            },
            properties: {
              sqlu: '001-001-001-001',
              inscricaoImobiliaria: '354400010001',
              endereco: 'Rua Teste',
              numero: '100',
              bairro: 'Centro',
              areaTerreno: 250,
              zoneamento: 'RESIDENCIAL',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        featureCollection as any,
        'GEOJSON',
        'test.geojson',
        false,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(0);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should skip features without valid geometry', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: null,
            properties: {
              sqlu: '001-001-001-001',
              inscricaoImobiliaria: '354400010001',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        featureCollection as any,
        'GEOJSON',
        'test.geojson',
        false,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(1);
    });

    it('should skip features without sqlu or inscription', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-45.0, -23.0],
                [-45.0, -23.01],
                [-45.01, -23.01],
                [-45.01, -23.0],
                [-45.0, -23.0],
              ]],
            },
            properties: {
              endereco: 'Rua Teste',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        featureCollection as any,
        'GEOJSON',
        'test.geojson',
        false,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(1);
    });

    it('should map property aliases correctly', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-45.0, -23.0],
                [-45.0, -23.01],
                [-45.01, -23.01],
                [-45.01, -23.0],
                [-45.0, -23.0],
              ]],
            },
            properties: {
              SQLU: '001-001-001-001',
              inscricao: '354400010001',
              nome: 'Rua Teste',
              zona: 'RESIDENCIAL',
              area_m2: 300,
            },
          },
        ],
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        featureCollection as any,
        'GEOJSON',
        'test.geojson',
        false,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(1);
    });

    it('should handle upsert when parcel exists', async () => {
      mockRepository.findBySqlu = jest.fn().mockResolvedValue({ id: 'existing-parcel', sqlu: '001-001-001-001' });

      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-45.0, -23.0],
                [-45.0, -23.01],
                [-45.01, -23.01],
                [-45.01, -23.0],
                [-45.0, -23.0],
              ]],
            },
            properties: {
              sqlu: '001-001-001-001',
              inscricaoImobiliaria: '354400010001',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        featureCollection as any,
        'GEOJSON',
        'test.geojson',
        true,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should reject malformed GeoJSON payloads before import processing', async () => {
      await expect(
        service.importGeojson(
          '66f1f77a67e30f9f62000001',
          '66f1f77a67e30f9f62000002',
          { type: 'FeatureCollection', features: [{ type: 'Feature', properties: null }] } as any,
          'GEOJSON',
          'test.geojson',
          false,
          '66f1f77a67e30f9f62000003',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('importFromCsvEnrichment', () => {
    it('should update existing parcel with CSV data', async () => {
      mockRepository.findBySqlu = jest.fn().mockResolvedValue({
        id: 'existing-parcel',
        sqlu: '001-001-001-001',
        inscricaoImobiliaria: '354400010001',
        enderecoPrincipal: {},
      });

      const csv = `sqlu,inscricao,areaTerreno,valorVenalTotal,iptuLancado,iptuPago,statusIPTU
001-001-001-001,354400010001,300,150000,500,450,QUITADO`;

      const result = await service.importFromCsvEnrichment(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        csv,
        'CSV_ENRICHMENT',
        'test.csv',
        undefined,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.updated).toBe(1);
      expect(result.notFound).toBe(0);
    });

    it('should report not found when parcel does not exist', async () => {
      mockRepository.findBySqlu = jest.fn().mockResolvedValue(null);

      const csv = `sqlu,inscricao,areaTerreno
999-999-999-999,999999999999,300`;

      const result = await service.importFromCsvEnrichment(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        csv,
        'CSV_ENRICHMENT',
        'test.csv',
        undefined,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.updated).toBe(0);
      expect(result.notFound).toBe(1);
    });

    it('should require sqlu or inscription for linkage', async () => {
      const csv = `areaTerreno
300`;

      const result = await service.importFromCsvEnrichment(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        csv,
        'CSV_ENRICHMENT',
        'test.csv',
        undefined,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.errors).toBe(1);
    });
  });

  describe('payload contract – wrapped envelope vs raw FeatureCollection', () => {
    const validFeature = {
      type: 'Feature' as const,
      id: 'contract-1',
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-45.0, -23.0],
          [-45.0, -23.01],
          [-45.01, -23.01],
          [-45.01, -23.0],
          [-45.0, -23.0],
        ]],
      },
      properties: { sqlu: 'CONTRACT-001', inscricaoImobiliaria: '354400010001' },
    };

    it('accepts featureCollection extracted from wrapped envelope { data: FC, sourceType, fileName, upsert }', async () => {
      const wrappedBody = {
        data: { type: 'FeatureCollection' as const, features: [validFeature] },
        sourceType: 'OFFICIAL_IMPORT',
        fileName: 'contract-test.geojson',
        upsert: false,
      };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        wrappedBody.data as any,
        wrappedBody.sourceType,
        wrappedBody.fileName,
        wrappedBody.upsert,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(0);
      expect(mockImportBatchRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ sourceType: 'OFFICIAL_IMPORT', fileName: 'contract-test.geojson' }),
      );
    });

    it('accepts raw FeatureCollection directly (fallback path used by project-scoped controller)', async () => {
      const rawFc = { type: 'FeatureCollection' as const, features: [validFeature] };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        rawFc as any,
        'GEOJSON',
        undefined,
        false,
        '66f1f77a67e30f9f62000003',
      );

      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(0);
    });

    it('rejects when body.data is missing and type is not FeatureCollection (simulates malformed request)', async () => {
      const emptyFc = { type: 'FeatureCollection' as const, features: [] };

      const result = await service.importGeojson(
        '66f1f77a67e30f9f62000001',
        '66f1f77a67e30f9f62000002',
        emptyFc as any,
      );

      expect(result.inserted).toBe(0);
      expect(result.batchId).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
      mockRepository.list = jest.fn().mockResolvedValue([
        { sqlu: '001', isOfficial: true, statusIPTU: 'QUITADO', valorVenalTotal: 100000, iptuLancado: 500, iptuPago: 500, iptuEmAberto: 0 },
        { sqlu: '002', isOfficial: true, statusIPTU: 'INADIMPLENTE', valorVenalTotal: 150000, iptuLancado: 750, iptuPago: 0, iptuEmAberto: 750 },
        { sqlu: '003', isOfficial: false, sourceType: 'DEMO', statusIPTU: undefined, valorVenalTotal: 0, iptuLancado: 0, iptuPago: 0, iptuEmAberto: 0 },
      ]);

      const result = await service.getStatistics('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002');

      expect(result.total).toBe(3);
      expect(result.official).toBe(2);
      expect(result.demo).toBe(1);
      expect(result.withSqlu).toBe(3);
      expect(result.withIptu).toBe(2);
      expect(result.totalValorVenal).toBe(250000);
      expect(result.totalIptuLancado).toBe(1250);
      expect(result.totalIptuPago).toBe(500);
      expect(result.totalIptuEmAberto).toBe(750);
      expect(result.inadimplentes).toBe(1);
      expect(result.taxaAdimplencia).toBe(50);
    });
  });
});
