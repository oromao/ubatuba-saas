import { AreasService } from '../src/modules/areas/areas.service';
import { AreasRepository } from '../src/modules/areas/areas.repository';
import { CacheService } from '../src/modules/shared/cache.service';
import { Types } from 'mongoose';

const mockRepository = {
  list: jest.fn().mockResolvedValue([
    {
      id: 'area-1',
      name: 'Área de Proteção',
      group: 'AMBIENTAL',
      color: '#00ff00',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10, 10],
            [20, 10],
            [20, 20],
            [10, 20],
            [10, 10],
          ],
        ],
      },
    },
  ]),
} as unknown as AreasRepository;

const mockCache = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
} as unknown as CacheService;

describe('AreasService', () => {
  let service: AreasService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AreasService(mockRepository, mockCache);
  });

  it('should return cached areas if available', async () => {
    const tenantId = new Types.ObjectId().toString();
    const cachedData = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          id: 'area-cached',
          geometry: {
            type: 'Polygon' as const,
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0],
              ],
            ],
          },
          properties: {
            name: 'Cached Area',
            group: 'ZONE',
            color: '#ff0000',
          },
        },
      ],
    };

    mockCache.get = jest.fn().mockResolvedValue(cachedData);

    const result = await service.list(tenantId, 'ZONE');

    expect(mockCache.get).toHaveBeenCalledWith(`areas:${tenantId}:ZONE`);
    expect(mockRepository.list).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData);
  });

  it('should query repository, structure data as GeoJSON FeatureCollection, and cache it if not in cache', async () => {
    const tenantId = new Types.ObjectId().toString();
    mockCache.get = jest.fn().mockResolvedValue(null);

    const result = await service.list(tenantId);

    expect(mockCache.get).toHaveBeenCalledWith(`areas:${tenantId}:all`);
    expect(mockRepository.list).toHaveBeenCalledWith(tenantId, undefined);
    expect(mockCache.set).toHaveBeenCalledWith(
      `areas:${tenantId}:all`,
      expect.objectContaining({
        type: 'FeatureCollection',
        features: [
          expect.objectContaining({
            type: 'Feature',
            id: 'area-1',
            properties: {
              name: 'Área de Proteção',
              group: 'AMBIENTAL',
              color: '#00ff00',
            },
          }),
        ],
      }),
      30,
    );

    expect(result.type).toBe('FeatureCollection');
    expect(result.features[0].id).toBe('area-1');
  });
});
