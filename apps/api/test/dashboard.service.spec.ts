import { DashboardService } from '../src/modules/dashboard/dashboard.service';

describe('DashboardService', () => {
  const processesService: any = { list: jest.fn().mockResolvedValue([1, 2]) };
  const alertsService: any = { list: jest.fn().mockResolvedValue([{ stage: 'TRIAGEM' }, { stage: 'FISCALIZACAO' }]) };
  const assetsService: any = { list: jest.fn().mockResolvedValue([1]) };
  const permitsWorksService: any = { list: jest.fn().mockResolvedValue([{ status: 'EM_ANALISE' }]) };
  const permitsBusinessService: any = { list: jest.fn().mockResolvedValue([{ status: 'ABERTO' }]) };
  const citizen156Service: any = { list: jest.fn().mockResolvedValue([{ status: 'ABERTO' }, { status: 'EM_ANALISE' }]) };
  const environmentService: any = { list: jest.fn().mockResolvedValue([{ status: 'ABERTO' }]) };
  const publicWorksService: any = { list: jest.fn().mockResolvedValue([{ status: 'EM_EXECUCAO' }]) };
  const cemeteryService: any = { list: jest.fn().mockResolvedValue([{ status: 'LIVRE' }, { status: 'OCUPADO' }]) };
  const parcelsService: any = { getStatistics: jest.fn().mockResolvedValue({ total: 100, official: 5, demo: 0, withSqlu: 80, taxaAdimplencia: 90, totalValorVenal: 1000000, totalIptuLancado: 10000, totalIptuPago: 9000, totalIptuEmAberto: 1000, byStatus: { 'PAGO': 90, 'ABERTO': 10 } }) };
  const cacheService: any = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
  const layoutModel: any = {
    findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    findOneAndUpdate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({}) }),
  };
  const service = new DashboardService(
    processesService,
    alertsService,
    assetsService,
    permitsWorksService,
    permitsBusinessService,
    citizen156Service,
    environmentService,
    publicWorksService,
    cemeteryService,
    parcelsService,
    cacheService,
    layoutModel,
  );

  it('aggregates executive data by secretaria and priorities', async () => {
    const result = (await service.getExecutive('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002')) as any;
    expect(result.summary.processos).toBe(2);
    expect(result.summary.obrasPublicas).toBe(1);
    expect(result.secretarias).toHaveLength(6);
    expect(result.satelliteHealth).toHaveLength(4);
    expect(result.readinessSignals).toHaveLength(4);
    expect(result.ctm.totalParcelas).toBe(100);
    expect(result.ctm.comSqlu).toBe(80);
    expect(result.priorities[0].label).toBe('Obras em andamento');
  });

  it('returns a complete default layout when there is no persisted configuration', async () => {
    const layout = (await service.getLayout('66f1f77a67e30f9f62000001', '66f1f77a67e30f9f62000002')) as any;
    expect(layout.viewMode).toBe('executive');
    expect(layout.widgets).toHaveLength(8);
    expect(layout.widgets.map((widget: any) => widget.id)).toEqual([
      'summary',
      'secretarias',
      'priorities',
      'satelliteHealth',
      'readinessSignals',
      'map',
      'operations',
      'integrations',
    ]);
  });
});
