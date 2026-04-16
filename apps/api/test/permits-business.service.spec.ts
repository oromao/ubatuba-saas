import { BadRequestException } from '@nestjs/common';
import { PermitsBusinessService } from '../src/modules/permits-business/permits-business.service';
import { PermitsBusinessRepository } from '../src/modules/permits-business/permits-business.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({
    protocolNumber: 'EM-1',
    save: jest.fn(),
  }),
  findById: jest.fn(),
  save: jest.fn().mockResolvedValue({}),
  list: jest.fn(),
} as unknown as PermitsBusinessRepository;

const projectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
} as unknown as ProjectsService;

const storage = {
  putObject: jest.fn().mockResolvedValue({}),
} as unknown as ObjectStorageService;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('PermitsBusinessService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates business permit request with workflow metadata', async () => {
    const service = new PermitsBusinessService(repository, projectsService, storage, cache);
    const created = await service.create('tenant-1', {
      companyName: 'Empresa Demo',
      cnpj: '123',
      activityDescription: 'Servicos',
    });

    expect(created.protocolNumber).toContain('EM-');
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ currentStage: 'ABERTURA' }));
  });

  it('rejects invalid workflow transition', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      currentStage: 'ABERTURA',
      status: 'ABERTO',
      taxes: [],
      evidences: [],
      history: [],
      save: jest.fn(),
    });
    const service = new PermitsBusinessService(repository, projectsService, storage, cache);

    await expect(
      service.update('tenant-1', 'req-1', { stage: 'EMISSAO' as never }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('supports decision workflow', async () => {
    const doc: any = {
      currentStage: 'ANALISE_TECNICA',
      status: 'EM_ANALISE',
      taxes: [],
      evidences: [],
      history: [],
      save: jest.fn(),
    };
    (repository.findById as jest.Mock).mockResolvedValue(doc);
    const service = new PermitsBusinessService(repository, projectsService, storage, cache);

    await service.addEvidence('tenant-1', 'req-1', 'Doc', 'ok');
    await service.decide('tenant-1', 'req-1', 'DEFERIDO', 'OK');

    expect(doc.decision?.kind).toBe('DEFERIDO');
    expect(doc.currentStage).toBe('ENCERRAMENTO');
  });
});
