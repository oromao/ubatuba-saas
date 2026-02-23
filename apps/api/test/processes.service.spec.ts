import { ProcessesService } from '../src/modules/processes/processes.service';
import { ProcessesRepository } from '../src/modules/processes/processes.repository';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({ id: 'proc-1' }),
  addEvent: jest.fn(),
  update: jest.fn(),
} as unknown as ProcessesRepository;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('ProcessesService', () => {
  it('creates process with tenantId', async () => {
    const service = new ProcessesService(repository, cache);
    const tenantId = '66f1f77a67e30f9f62000004';
    await service.create(tenantId, { title: 'Teste', owner: 'Secretaria' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: expect.anything() }),
    );
  });
});
