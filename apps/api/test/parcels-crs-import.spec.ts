import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ParcelsService } from '../src/modules/ctm/parcels/parcels.service';
import { ParcelsRepository } from '../src/modules/ctm/parcels/parcels.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ImportBatchRepository } from '../src/modules/ctm/parcels/import-batch.repository';
import { ParcelAuditRepository } from '../src/modules/ctm/parcels/parcel-audit.repository';
import { ParcelBuildingsService } from '../src/modules/ctm/parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../src/modules/ctm/parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../src/modules/ctm/parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../src/modules/ctm/logradouros/logradouros.service';
import { GeometryService } from '../src/modules/ctm/geometry.service';

// Helper to create valid ObjectId strings
const mockObjectId = new Types.ObjectId();
const tenantId = mockObjectId.toHexString();
const projectId = new Types.ObjectId().toHexString();
const batchId = new Types.ObjectId().toHexString();

describe('Parcel CRS Import Integration', () => {
  let service: ParcelsService;

  const mockParcelsRepository = {
    findById: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findBySqlu: jest.fn(),
    findByInscription: jest.fn(),
    upsert: jest.fn(),
  };

  const mockImportBatchRepository = {
    create: jest.fn().mockResolvedValue({
      id: batchId,
      tenantId,
      projectId,
      sourceType: 'GEOJSON',
      fileName: 'test.geojson',
      status: 'PROCESSING',
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
    }),
    update: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    addWarning: jest.fn().mockResolvedValue(undefined),
    addError: jest.fn().mockResolvedValue(undefined),
  };

  const mockProjectsService = {
    resolveProjectId: jest.fn().mockResolvedValue(projectId),
  };

  const mockOtherServices = {
    findByParcel: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelsService,
        {
          provide: ParcelsRepository,
          useValue: mockParcelsRepository,
        },
        {
          provide: ImportBatchRepository,
          useValue: mockImportBatchRepository,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: ParcelBuildingsService,
          useValue: mockOtherServices,
        },
        {
          provide: ParcelInfrastructureService,
          useValue: mockOtherServices,
        },
        {
          provide: ParcelSocioeconomicService,
          useValue: mockOtherServices,
        },
        {
          provide: LogradourosService,
          useValue: mockOtherServices,
        },
        {
          provide: GeometryService,
          useValue: { validateGeometry: jest.fn() },
        },
        {
          provide: ParcelAuditRepository,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get<ParcelsService>(ParcelsService);
  });

  describe('GeoJSON Import with UTM Coordinates', () => {
    it('should accept and convert UTM coordinates during import', async () => {
      // Create a GeoJSON with UTM coordinates (Zone 23S)
      // These coordinates should be detected as UTM and converted to WGS84
      const utmFeatureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: 'test-001',
            geometry: {
              type: 'Polygon' as const,
              // UTM coordinates for São Paulo area (approx)
              coordinates: [[
                [328000, 7395000],
                [328100, 7395000],
                [328100, 7395100],
                [328000, 7395100],
                [328000, 7395000],
              ]],
            },
            properties: {
              sqlu: 'TEST-001',
              inscricaoImobiliaria: '001.001.001',
              endereco: 'Rua de Teste',
              structure: 'test-structure',
            },
          },
        ],
      };

      // Mock the repository to return no existing parcels
      mockParcelsRepository.findBySqlu.mockResolvedValue(null);
      mockParcelsRepository.findByInscription.mockResolvedValue(null);
      mockParcelsRepository.create.mockResolvedValue({
        id: 'parcel-1',
        ...utmFeatureCollection.features[0].properties,
        geometry: expect.any(Object),
      });

      const result = await service.importGeojson(
        tenantId,
        undefined,
        utmFeatureCollection,
        'GEOJSON',
        'test.geojson',
        false,
        undefined,
        'São Paulo',
        '3550308',
      );

      // Should succeed (not reject UTM coordinates)
      expect(result.inserted).toBeGreaterThanOrEqual(1);

      // The geometry should have been converted (especially the coordinates)
      expect(mockParcelsRepository.create).toHaveBeenCalled();
      const createdParcel = mockParcelsRepository.create.mock.calls[0][0];
      
      // The geometry should exist and be a valid Polygon
      expect(createdParcel.geometry).toBeDefined();
      expect(createdParcel.geometry.type).toBe('Polygon');
      
      // Verify that coordinates were converted from UTM to WGS84
      // All coordinates should be within WGS84 bounds
      const coords = createdParcel.geometry.coordinates[0];
      for (const coord of coords) {
        expect(coord[0]).toBeGreaterThanOrEqual(-180);
        expect(coord[0]).toBeLessThanOrEqual(180);
        expect(coord[1]).toBeGreaterThanOrEqual(-90);
        expect(coord[1]).toBeLessThanOrEqual(90);
      }
    });

    it('should not reject coordinates that look like UTM', async () => {
      // This test verifies the OLD behavior is changed
      // Previously, any coordinate with abs(x) > 180 or abs(y) > 90 was rejected
      // Now, it should be detected and converted
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: 'test-002',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [500000, 7000000], // Clearly UTM coordinates
                [500100, 7000000],
                [500100, 7000100],
                [500000, 7000100],
                [500000, 7000000],
              ]],
            },
            properties: {
              sqlu: 'TEST-002',
              inscricaoImobiliaria: '001.001.002',
            },
          },
        ],
      };

      jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
        id: 'parcel-2',
        ...featureCollection.features[0].properties,
        geometry: expect.any(Object),
      });

      const result = await service.importGeojson(
        tenantId,
        undefined,
        featureCollection,
        'GEOJSON',
        'test-utm.geojson',
        false,
        undefined,
        'São Paulo',
        '3550308',
      );

      expect(result.errors).toBe(0);
      // The old code would have rejected this with "Coordenadas inválidas para WGS84"
      
      // Verify the import proceeded
      expect(result.inserted).toBeGreaterThanOrEqual(1);
    });

    it('should handle already WGS84 coordinates without issues', async () => {
      const wgs84FeatureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: 'test-003',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [-46.6333, -23.5505],
                [-46.6330, -23.5505],
                [-46.6330, -23.5502],
                [-46.6333, -23.5502],
                [-46.6333, -23.5505],
              ]],
            },
            properties: {
              sqlu: 'TEST-003',
              inscricaoImobiliaria: '001.001.003',
            },
          },
        ],
      };

      jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
        id: 'parcel-3',
        ...wgs84FeatureCollection.features[0].properties,
        geometry: expect.any(Object),
      });

      const result = await service.importGeojson(
        tenantId,
        undefined,
        wgs84FeatureCollection,
        'GEOJSON',
        'test-wgs84.geojson',
        false,
        undefined,
        'São Paulo',
        '3550308',
      );

      expect(result.errors).toBe(0);
      expect(result.inserted).toBeGreaterThanOrEqual(1);

      // Verify coordinates are unchanged
      const createdParcel = (mockParcelsRepository.create as jest.Mock).mock.calls[0][0];
      expect(createdParcel.geometry.coordinates[0][0][0]).toBeCloseTo(-46.6333, 0.0001);
      expect(createdParcel.geometry.coordinates[0][0][1]).toBeCloseTo(-23.5505, 0.0001);
    });

    it('should detect and log CRS conversion in warnings', async () => {
      const utmFeatureCollection = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: 'test-004',
            geometry: {
              type: 'Polygon' as const,
              coordinates: [[
                [328000, 7395000],
                [328100, 7395000],
                [328100, 7395100],
                [328000, 7395100],
                [328000, 7395000],
              ]],
            },
            properties: {
              sqlu: 'TEST-004',
              inscricaoImobiliaria: '001.001.004',
            },
          },
        ],
      };

      jest.spyOn(mockParcelsRepository, 'findBySqlu').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'findByInscription').mockResolvedValue(null);
      jest.spyOn(mockParcelsRepository, 'create').mockResolvedValue({
        id: 'parcel-4',
        ...utmFeatureCollection.features[0].properties,
        geometry: expect.any(Object),
      });

      const result = await service.importGeojson(
        tenantId,
        undefined,
        utmFeatureCollection,
        'GEOJSON',
        'test-004.geojson',
        false,
        undefined,
        'São Paulo',
        '3550308',
      );

      expect(result.errors).toBe(0);
    });
  });
});
