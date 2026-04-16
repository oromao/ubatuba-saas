import { AlertsService } from '../src/modules/alerts/alerts.service';
import { AlertsRepository } from '../src/modules/alerts/alerts.repository';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn(),
  findById: jest.fn().mockResolvedValue({
    evidenceKeys: [],
    timeline: [],
  }),
} as unknown as AlertsRepository;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('AlertsService', () => {
  it('creates alert with stage and evidence', async () => {
    const service = new AlertsService(repository, cache);
    await service.create('66f1f77a67e30f9f62000001', {
      title: 'Nova ocupacao',
      level: 'ALTO',
      lat: -23.4,
      lng: -45.1,
      evidenceKeys: ['evidence-1'],
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: 'TRIAGEM',
        evidenceKeys: ['evidence-1'],
      }),
    );
  });
});
