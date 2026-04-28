import { Test, TestingModule } from '@nestjs/testing';
import { GisService } from '../src/modules/gis/gis.service';
import { getModelToken } from '@nestjs/mongoose';
import { Parcel } from '../src/modules/ctm/parcels/parcel.schema';

const mockParcelModel = {
  find: jest.fn(),
  countDocuments: jest.fn(),
  exec: jest.fn(),
};

const mockBbox: [number, number, number, number] = [-46.7, -23.6, -46.5, -23.4];

describe('GisService', () => {
  let service: GisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GisService,
        {
          provide: getModelToken(Parcel.name),
          useValue: mockParcelModel,
        },
      ],
    }).compile();

    service = module.get<GisService>(GisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queryBboxViewport', () => {
    it('should limit results to max 1000', async () => {
      const mockFeatures = Array(500).fill({
        _id: '123',
        sqlu: 'TEST-001',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
        rawProperties: {},
      });

      mockParcelModel.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockFeatures),
            }),
          }),
        }),
      });
      mockParcelModel.countDocuments = jest.fn().mockResolvedValue(5000);
      mockParcelModel.exec = jest.fn().mockResolvedValue(mockFeatures);

      const result = await service.queryBboxViewport({
        tenantId: '60d5ec9f8b3a3e001f8e4a1b',
        projectId: '60d5ec9f8b3a3e001f8e4a1c',
        bbox: mockBbox,
        limit: 2000,
      });

      expect(result.limit).toBe(1000); // Capped at 1000
      expect(result.features.length).toBe(500);
      expect(result.total).toBe(5000);
      expect(result.type).toBe('FeatureCollection');
    });

    it('should cap limit at 1000 even if requested higher', async () => {
      mockParcelModel.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });
      mockParcelModel.countDocuments = jest.fn().mockResolvedValue(0);

      const result = await service.queryBboxViewport({
        tenantId: '60d5ec9f8b3a3e001f8e4a1b',
        projectId: '60d5ec9f8b3a3e001f8e4a1c',
        bbox: mockBbox,
        limit: 5000, // Requesting more than max
      });

      expect(result.limit).toBe(1000); // Forced to max
    });

    it('should use geoIntersects query for bbox', async () => {
      const mockQuery = {
        tenantId: expect.anything(),
        projectId: expect.anything(),
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: 'Polygon',
              coordinates: expect.arrayContaining([expect.arrayContaining([-46.7, -23.6])]),
            },
          },
        },
      };

      mockParcelModel.find = jest.fn().mockImplementation((query) => {
        expect(query).toMatchObject(mockQuery);
        return {
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
      });
      mockParcelModel.countDocuments = jest.fn().mockResolvedValue(0);

      await service.queryBboxViewport({
        tenantId: '60d5ec9f8b3a3e001f8e4a1b',
        projectId: '60d5ec9f8b3a3e001f8e4a1c',
        bbox: mockBbox,
      });
    });
  });

  describe('getBboxFromCoordinates', () => {
    it('should return bbox tuple', () => {
      const coords: [number, number, number, number] = [-46.7, -23.6, -46.5, -23.4];
      const result = service.getBboxFromCoordinates(coords);
      expect(result).toEqual(coords);
    });
  });
});
