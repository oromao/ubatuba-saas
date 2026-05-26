import { AssetsService } from '../src/modules/assets/assets.service';
import { AssetsRepository } from '../src/modules/assets/assets.repository';
import { CacheService } from '../src/modules/shared/cache.service';
import { Types } from 'mongoose';

const mockRepository = {
  list: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((data) => Promise.resolve({ id: new Types.ObjectId().toString(), ...data })),
  update: jest.fn().mockImplementation((tenantId, id, data) => Promise.resolve({ id, ...data })),
  delete: jest.fn().mockResolvedValue(true),
} as unknown as AssetsRepository;

const mockCache = {
  invalidateByPrefix: jest.fn().mockResolvedValue(undefined),
} as unknown as CacheService;

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AssetsService(mockRepository, mockCache);
  });

  it('should list assets', async () => {
    const tenantId = new Types.ObjectId().toString();
    const result = await service.list(tenantId, 'bbox-string');
    expect(mockRepository.list).toHaveBeenCalledWith(tenantId, 'bbox-string');
    expect(result).toEqual([]);
  });

  it('should find asset by id', async () => {
    const tenantId = new Types.ObjectId().toString();
    const assetId = new Types.ObjectId().toString();
    await service.findById(tenantId, assetId);
    expect(mockRepository.findById).toHaveBeenCalledWith(tenantId, assetId);
  });

  it('should create asset and invalidate cache', async () => {
    const tenantId = new Types.ObjectId().toString();
    const dto = {
      name: 'Asset 1',
      category: 'VEICULO',
      lat: -23.4,
      lng: -45.1,
    };

    const result = await service.create(tenantId, dto);

    expect(mockRepository.create).toHaveBeenCalledWith({
      tenantId: expect.any(Object),
      name: 'Asset 1',
      category: 'VEICULO',
      status: 'ATIVO',
      location: { type: 'Point', coordinates: [-45.1, -23.4] },
    });
    expect(mockCache.invalidateByPrefix).toHaveBeenCalledWith(`assets:${tenantId}`);
    expect(result.name).toBe('Asset 1');
  });

  it('should update asset and invalidate cache', async () => {
    const tenantId = new Types.ObjectId().toString();
    const assetId = new Types.ObjectId().toString();
    const dto = {
      name: 'Asset Updated',
    };

    await service.update(tenantId, assetId, dto);

    expect(mockRepository.update).toHaveBeenCalledWith(tenantId, assetId, dto);
    expect(mockCache.invalidateByPrefix).toHaveBeenCalledWith(`assets:${tenantId}`);
  });

  it('should remove asset and invalidate cache', async () => {
    const tenantId = new Types.ObjectId().toString();
    const assetId = new Types.ObjectId().toString();

    const result = await service.remove(tenantId, assetId);

    expect(mockRepository.delete).toHaveBeenCalledWith(tenantId, assetId);
    expect(mockCache.invalidateByPrefix).toHaveBeenCalledWith(`assets:${tenantId}`);
    expect(result).toEqual({ success: true });
  });
});
