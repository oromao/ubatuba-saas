import { Test, TestingModule } from '@nestjs/testing';
import { LayersService } from '../src/modules/layers/layers.service';
import { LayersRepository } from '../src/modules/layers/layers.repository';
import { CacheService } from '../src/modules/shared/cache.service';

describe('LayersService', () => {
  let service: LayersService;
  const repository = {
    list: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };
  const cacheService = {
    get: jest.fn(),
    set: jest.fn(),
    invalidateByPrefix: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LayersService,
        { provide: LayersRepository, useValue: repository },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get(LayersService);
  });

  it('imports a layer as external and preserves sourceUrl fields', async () => {
    const tenantId = '507f1f77bcf86cd799439011';
    repository.create.mockResolvedValue({
      toObject: () => ({
        _id: 'layer-1',
        tenantId,
        name: 'Camada Teste',
        group: 'Grupo',
        type: 'vector',
        source: 'external',
        tileUrl: 'https://example.com/test.geojson',
        dataUrl: 'https://example.com/test.geojson',
      }),
    });

    const result = await service.importLayer(tenantId, {
      name: 'Camada Teste',
      group: 'Grupo',
      sourceType: 'geojson_url',
      sourceUrl: 'https://example.com/test.geojson',
      geometryType: 'polygon',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'external',
        tileUrl: 'https://example.com/test.geojson',
        dataUrl: 'https://example.com/test.geojson',
        geometryType: 'polygon',
      }),
    );
    expect(result).toMatchObject({
      id: 'layer-1',
      name: 'Camada Teste',
      source: 'external',
      tileUrl: 'https://example.com/test.geojson',
    });
  });
});
