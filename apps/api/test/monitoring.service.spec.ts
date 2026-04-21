import { MonitoringService } from '../src/modules/monitoring/monitoring.service';
import { MonitoringRepository } from '../src/modules/monitoring/monitoring.repository';
import { AlertsService } from '../src/modules/alerts/alerts.service';
import { CacheService } from '../src/modules/shared/cache.service';
import { BadRequestException } from '@nestjs/common';

const repository = {
  create: jest.fn().mockResolvedValue({}),
  findById: jest.fn().mockResolvedValue({
    stage: 'TRIAGEM',
    save: jest.fn().mockResolvedValue({}),
    timeline: [],
    evidenceKeys: [],
  }),
  list: jest.fn().mockResolvedValue([
    { stage: 'TRIAGEM', severity: 'ALTA', source: 'CEMADEN', sourceMode: 'API', createdAt: new Date().toISOString(), evidenceKeys: ['ev-1'] },
    { stage: 'DESFECHO', severity: 'CRITICA', source: 'DRONE', sourceMode: 'SATELLITE', createdAt: new Date().toISOString(), evidenceKeys: [] },
  ]),
} as unknown as MonitoringRepository;

const alertsService = {
  create: jest.fn().mockResolvedValue({}),
} as unknown as AlertsService;

const cache = {
  invalidateByPrefix: jest.fn(),
} as unknown as CacheService;

describe('MonitoringService', () => {
  it('ingests environmental event and creates alert', async () => {
    const service = new MonitoringService(repository, alertsService, cache);
    await service.ingest('66f1f77a67e30f9f62000001', {
      type: 'INUNDACAO',
      title: 'Chuva intensa',
      severity: 'ALTA',
      lat: -23.4,
      lng: -45.1,
      source: 'CEMADEN',
      sourceMode: 'API',
      sourceAdapter: 'CEMADEN',
    });
    expect(alertsService.create).toHaveBeenCalled();
  });

  it('advances monitoring stage and returns dashboard metrics', async () => {
    const service = new MonitoringService(repository, alertsService, cache);
    await service.triage('66f1f77a67e30f9f62000001', 'evt-1', { message: 'Triagem' });
    const dashboard = await service.dashboard('66f1f77a67e30f9f62000001');
    expect(dashboard.triagem).toBeGreaterThanOrEqual(1);
    expect(dashboard.sourceBreakdown.length).toBeGreaterThanOrEqual(1);
    expect(dashboard.sourceModeBreakdown.length).toBeGreaterThanOrEqual(1);
    expect(dashboard.feedAdapters.length).toBe(3);
    expect(dashboard.recentTimeline.length).toBeGreaterThanOrEqual(1);
  });

  it('keeps dashboard aggregation stable when filters are applied', async () => {
    const filteredRepository = {
      ...repository,
      list: jest.fn().mockResolvedValue([
        { stage: 'TRIAGEM', severity: 'ALTA', source: 'CEMADEN', sourceMode: 'API', createdAt: new Date().toISOString(), evidenceKeys: ['ev-1'] },
      ]),
    } as unknown as MonitoringRepository;
    const service = new MonitoringService(filteredRepository, alertsService, cache);
    const dashboard = await service.dashboard('66f1f77a67e30f9f62000001', {
      stage: 'TRIAGEM',
      sourceMode: 'API',
    });

    expect(filteredRepository.list).toHaveBeenCalledWith(
      '66f1f77a67e30f9f62000001',
      expect.objectContaining({
        stage: 'TRIAGEM',
        sourceMode: 'API',
      }),
    );
    expect(dashboard.total).toBe(1);
    expect(dashboard.triagem).toBe(1);
    expect(dashboard.sourceModeBreakdown[0]).toMatchObject({ sourceMode: 'API', total: 1 });
  });

  it('promotes event to evidence stage when attaching evidence without explicit stage', async () => {
    const current = {
      stage: 'TRIAGEM',
      save: jest.fn().mockResolvedValue({}),
      timeline: [],
      evidenceKeys: [],
    };
    const repo = {
      ...repository,
      findById: jest.fn().mockResolvedValue(current),
    } as unknown as MonitoringRepository;
    const service = new MonitoringService(repo, alertsService, cache);
    await service.advance('66f1f77a67e30f9f62000001', 'evt-1', { evidenceKey: 'ev-99' });
    expect(current.stage).toBe('EVIDENCIA');
    expect(current.evidenceKeys).toContain('ev-99');
  });

  it('blocks invalid stage transition', async () => {
    const current = {
      stage: 'DESFECHO',
      save: jest.fn().mockResolvedValue({}),
      timeline: [],
      evidenceKeys: [],
    };
    const repo = {
      ...repository,
      findById: jest.fn().mockResolvedValue(current),
    } as unknown as MonitoringRepository;
    const service = new MonitoringService(repo, alertsService, cache);
    await expect(
      service.triage('66f1f77a67e30f9f62000001', 'evt-1', { message: 'Nao deve reabrir' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
