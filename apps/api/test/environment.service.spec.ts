import { EnvironmentService } from '../src/modules/environment/environment.service';
import { EnvironmentRepository } from '../src/modules/environment/environment.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ObjectStorageService } from '../src/modules/shared/object-storage.service';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({ protocolNumber: 'AM-20260401-ABC123' }),
  findById: jest.fn().mockResolvedValue({
    save: jest.fn(),
    history: [],
    tasks: [],
    status: 'ABERTO',
  }),
  save: jest.fn().mockResolvedValue({}),
  list: jest.fn(),
} as unknown as EnvironmentRepository;

const projectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
} as unknown as ProjectsService;

const storage = {
  putObject: jest.fn().mockResolvedValue({}),
} as unknown as ObjectStorageService;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('EnvironmentService', () => {
  it('creates environmental case', async () => {
    const service = new EnvironmentService(repository, projectsService, storage, cache);
    const created = await service.create('66f1f77a67e30f9f62000001', {
      title: 'Poda preventiva',
      category: 'PODA',
      tasks: ['Vistoria'],
    });
    expect(created.protocolNumber).toContain('AM-');
  });

  it('summarizes environmental backoffice state', async () => {
    const summaryRepo = {
      ...repository,
      list: jest.fn().mockResolvedValue([
        { status: 'ABERTO', tasks: [{}], evidenceKeys: ['a'] },
        { status: 'EM_ANALISE', tasks: [{}, {}], evidenceKeys: [] },
        { status: 'LAUDO', tasks: [], evidenceKeys: ['b'] },
      ]),
    } as unknown as EnvironmentRepository;
    const service = new EnvironmentService(summaryRepo, projectsService, storage, cache);
    const summary = await service.summary('66f1f77a67e30f9f62000001');
    expect(summary.total).toBe(3);
    expect(summary.abertos).toBe(1);
    expect(summary.analise).toBe(1);
    expect(summary.laudos).toBe(1);
    expect(summary.tarefas).toBe(3);
    expect(summary.evidencias).toBe(2);
  });
});
