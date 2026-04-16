import { Citizen156Service } from '../src/modules/citizen-156/citizen-156.service';
import { Citizen156Repository } from '../src/modules/citizen-156/citizen-156.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { AlertsService } from '../src/modules/alerts/alerts.service';
import { CacheService } from '../src/modules/shared/cache.service';

const repository = {
  create: jest.fn().mockResolvedValue({ protocolNumber: '156-1' }),
  findById: jest.fn().mockResolvedValue({
    save: jest.fn(),
    history: [],
    status: 'ABERTO',
  }),
  save: jest.fn().mockResolvedValue({}),
  list: jest.fn().mockResolvedValue([
    { status: 'ABERTO', attachmentKeys: ['a'] },
    { status: 'EM_TRIAGEM', attachmentKeys: [] },
    { status: 'RESOLVIDO', attachmentKeys: ['b', 'c'] },
  ]),
} as unknown as Citizen156Repository;

const projectsService = {
  resolveProjectId: jest.fn().mockResolvedValue('proj-1'),
} as unknown as ProjectsService;

const alertsService = {
  advanceStage: jest.fn().mockResolvedValue({}),
} as unknown as AlertsService;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('Citizen156Service', () => {
  it('creates citizen call and links alert when provided', async () => {
    const service = new Citizen156Service(repository, projectsService, alertsService, cache);
    const created = await service.create('66f1f77a67e30f9f62000001', {
      title: 'Buraco na via',
      category: 'VIAS',
      alertId: 'alert-1',
    });
    expect(created.protocolNumber).toContain('156-');
    expect(alertsService.advanceStage).toHaveBeenCalled();
  });

  it('summarizes 156 operation state', async () => {
    const service = new Citizen156Service(repository, projectsService, alertsService, cache);
    const summary = await service.summary('66f1f77a67e30f9f62000001');
    expect(summary.total).toBe(3);
    expect(summary.abertos).toBe(1);
    expect(summary.triagem).toBe(1);
    expect(summary.resolvidos).toBe(1);
    expect(summary.anexos).toBe(3);
  });
});
