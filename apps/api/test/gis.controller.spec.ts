import { Test, TestingModule } from '@nestjs/testing';
import { GisController } from '../src/modules/gis/gis.controller';
import { GisService } from '../src/modules/gis/gis.service';

describe('GisController', () => {
  let controller: GisController;
  let gisService: jest.Mocked<GisService>;

  beforeEach(async () => {
    const mockGisService = {
      queryBboxViewport: jest.fn(),
      getBboxFromCoordinates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GisController],
      providers: [
        {
          provide: GisService,
          useValue: mockGisService,
        },
      ],
    }).compile();

    controller = module.get<GisController>(GisController);
    gisService = module.get(GisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('bboxQuery', () => {
    it('should return error when bbox is missing', async () => {
      const req = { tenantId: 'test-tenant' };
      const result = await controller.bboxQuery(req as any, 'test-project', '', undefined);
      
      expect(result.error).toContain('bbox parameter required');
      expect(result.features).toHaveLength(0);
      expect(result.limit).toBe(1000);
    });

    it('should return error when bbox format is invalid', async () => {
      const req = { tenantId: 'test-tenant' };
      const result = await controller.bboxQuery(req as any, 'test-project', 'invalid', undefined);
      
      expect(result.error).toContain('Invalid bbox format');
    });

    it('should return error when longitude values are invalid', async () => {
      const req = { tenantId: 'test-tenant' };
      const result = await controller.bboxQuery(req as any, 'test-project', '-200,-23.5,200,-23.4', undefined);
      
      expect(result.error).toContain('Invalid longitude values');
    });

    it('should return error when latitude values are invalid', async () => {
      const req = { tenantId: 'test-tenant' };
      const result = await controller.bboxQuery(req as any, 'test-project', '-46.5,-100,-46.4,100', undefined);
      
      expect(result.error).toContain('Invalid latitude values');
    });

    it('should call gisService.queryBboxViewport with correct params', async () => {
      const req = { tenantId: 'test-tenant' };
      const bbox = '-46.7,-23.6,-46.5,-23.4';
      const mockResult = {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
      };
      
      gisService.queryBboxViewport.mockResolvedValue(mockResult as any);
      
      const result = await controller.bboxQuery(req as any, 'test-project', bbox, '500');
      
      expect(gisService.queryBboxViewport).toHaveBeenCalledWith({
        tenantId: 'test-tenant',
        projectId: 'test-project',
        bbox: [-46.7, -23.6, -46.5, -23.4],
        limit: 500,
      });
      expect(result).toEqual(mockResult);
    });

    it('should enforce max limit of 1000', async () => {
      const req = { tenantId: 'test-tenant' };
      const bbox = '-46.7,-23.6,-46.5,-23.4';
      const mockResult = {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
      };
      
      gisService.queryBboxViewport.mockResolvedValue(mockResult as any);
      
      await controller.bboxQuery(req as any, 'test-project', bbox, '5000');
      
      expect(gisService.queryBboxViewport).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 1000, // Capped at max
        })
      );
    });

    it('should use default limit of 1000 when not specified', async () => {
      const req = { tenantId: 'test-tenant' };
      const bbox = '-46.7,-23.6,-46.5,-23.4';
      const mockResult = {
        type: 'FeatureCollection',
        features: [],
        total: 0,
        limit: 1000,
      };
      
      gisService.queryBboxViewport.mockResolvedValue(mockResult as any);
      
      await controller.bboxQuery(req as any, 'test-project', bbox, undefined);
      
      expect(gisService.queryBboxViewport).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 1000,
        })
      );
    });
  });
});
