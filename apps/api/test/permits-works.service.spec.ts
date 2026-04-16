import { BadRequestException } from '@nestjs/common';
import { PermitsWorksService } from '../src/modules/permits-works/permits-works.service';
import { PermitsWorksRepository } from '../src/modules/permits-works/permits-works.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({
    protocolNumber: 'OB-1',
    save: jest.fn(),
  }),
  findById: jest.fn(),
  save: jest.fn().mockResolvedValue({}),
  list: jest.fn(),
} as unknown as PermitsWorksRepository;

const projectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
} as unknown as ProjectsService;

const storage = {
  putObject: jest.fn().mockResolvedValue({}),
} as unknown as ObjectStorageService;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('PermitsWorksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates work permit request with workflow metadata', async () => {
    const service = new PermitsWorksService(repository, projectsService, storage, cache);
    const created = await service.create('tenant-1', {
      applicantName: 'Construtora Demo',
      subjectAddress: 'Rua A, 10',
      requirements: ['Projeto', 'ART'],
    });

    expect(created.protocolNumber).toContain('OB-');
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ currentStage: 'ABERTURA' }));
  });

  it('rejects invalid workflow transition', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({
      currentStage: 'ABERTURA',
      status: 'ABERTO',
      requirements: [],
      evidences: [],
      history: [],
      invoices: [],
      save: jest.fn(),
    });
    const service = new PermitsWorksService(repository, projectsService, storage, cache);

    await expect(
      service.update('tenant-1', 'req-1', { stage: 'ASSINATURA' as never }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('supports decision and evidence workflow', async () => {
    const doc: any = {
      currentStage: 'ANALISE_TECNICA',
      status: 'EM_ANALISE',
      requirements: [{ id: 'req-1', title: 'ART', status: 'ABERTA', createdAt: new Date().toISOString() }],
      evidences: [],
      history: [],
      invoices: [],
      save: jest.fn(),
    };
    (repository.findById as jest.Mock).mockResolvedValue(doc);
    const service = new PermitsWorksService(repository, projectsService, storage, cache);

    await service.addRequirementResponse('tenant-1', 'req-1', 'req-1', 'Atendido');
    await service.decide('tenant-1', 'req-1', 'DEFERIDO', 'OK');

    expect(doc.decision?.kind).toBe('DEFERIDO');
    expect(doc.currentStage).toBe('EMISSAO');
  });
});
