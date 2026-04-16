import { Test, TestingModule } from '@nestjs/testing';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ImportBatchRepository } from '../src/modules/ctm/parcels/import-batch.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { LogradourosService } from '../src/modules/ctm/logradouros/logradouros.service';
import { ParcelAuditRepository } from '../src/modules/ctm/parcels/parcel-audit.repository';

describe('ParcelsService External Demo Import', () => {
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
    create: jest.fn().mockResolvedValue({ id: 'batch-123', status: 'PROCESSING' }),
    update: jest.fn().mockResolvedValue({ id: 'batch-123', status: 'COMPLETED' }),
  };

  const mockProjectsService = {
    resolveProjectId: jest.fn().mockResolvedValue('project-123'),
  };

  beforeEach(async () => {
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

  describe('importGeojson with DEMO_EXTERNAL sourceType', () => {
    it('should import São Paulo GeoJSON with municipalityName', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              sql: '0010103001',
              inscricao: '1003001000',
              logradouro: 'Rua Example',
              numero: '100',
              bairro: 'Vila Example',
              area: 250,
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        'sao_paulo_lotes.geojson',
        false,
        'user-123',
        'São Paulo',
        '3550308',
      );

      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(0);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should set municipalityName when sourceType is DEMO_EXTERNAL', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              cod_sql: '0010103001',
              inscricao: '1003001000',
              nome_logr: 'Avenida Paulista',
              num: '1000',
              bairro_nome: 'Bela Vista',
              area_m2: 500,
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        undefined,
        false,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(1);
      const createCall = (mockRepository.create as jest.Mock).mock.calls[0][0];
      expect(createCall.municipalityName).toBe('São Paulo');
      expect(createCall.isOfficial).toBe(false);
      expect(createCall.sourceType).toBe('DEMO_EXTERNAL');
      expect(createCall.enderecoPrincipal.cidade).toBe('São Paulo');
    });

    it('should map setor/quadra/lote from GeoJSON properties', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              sql: '0010103001',
              setor: '001',
              quadra: '010',
              lote: '003',
              area_lote: 300,
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        'test.geojson',
        false,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(1);
      const createCall = (mockRepository.create as jest.Mock).mock.calls[0][0];
      expect(createCall.setor).toBe('001');
      expect(createCall.quadra).toBe('010');
      expect(createCall.lote).toBe('003');
      expect(createCall.sqlu).toBe('0010103001');
    });

    it('should handle OFFICIAL_SAMPLE sourceType correctly', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              sqlu: 'OFFICIAL-SP-001',
              inscricao: '35503080001',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'OFFICIAL_SAMPLE',
        'geosampa_sample.geojson',
        false,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(1);
      const createCall = (mockRepository.create as jest.Mock).mock.calls[0][0];
      expect(createCall.sourceType).toBe('OFFICIAL_SAMPLE');
      expect(createCall.isOfficial).toBe(false);
      expect(createCall.municipalityName).toBe('São Paulo');
    });

    it('should upsert when parcel already exists', async () => {
      mockRepository.findBySqlu = jest.fn().mockResolvedValue({ id: 'existing-parcel', sqlu: '0010103001' });

      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              sql: '0010103001',
              area: 350,
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        'test.geojson',
        true,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should skip invalid geometry features', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: null,
            properties: {
              sql: '0010103001',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        'test.geojson',
        false,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(1);
    });

    it('should require sqlu or inscription', async () => {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: '1',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6, -23.5],
                [-46.6, -23.55],
                [-46.65, -23.55],
                [-46.65, -23.5],
                [-46.6, -23.5],
              ]],
            },
            properties: {
              logradouro: 'Rua Teste',
            },
          },
        ],
      };

      const result = await service.importGeojson(
        'tenant-123',
        'project-123',
        featureCollection as any,
        'DEMO_EXTERNAL',
        'test.geojson',
        false,
        'user-123',
        'São Paulo',
      );

      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(1);
    });
  });
});
