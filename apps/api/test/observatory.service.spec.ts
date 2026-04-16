import { ObservatoryService } from '../src/modules/observatory/observatory.service';

describe('ObservatoryService', () => {
  const parcelsService: any = {
    list: jest.fn().mockResolvedValue([
      { id: 'p1', zoneId: 'Z1', workflowStatus: 'PENDENTE', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua A' } },
      { id: 'p2', zoneId: 'Z1', workflowStatus: 'APROVADA', enderecoPrincipal: { bairro: 'Centro', logradouro: 'Rua B' } },
      { id: 'p3', zoneId: 'Z2', workflowStatus: 'CONFLITO', enderecoPrincipal: { bairro: 'Itagua', logradouro: 'Av C' } },
    ]),
  };
  const valuationsService: any = {
    list: jest.fn().mockResolvedValue([
      { parcelId: 'p1', totalValue: 1000, landValue: 700, constructionValue: 300, createdAt: new Date().toISOString() },
      { parcelId: 'p2', totalValue: 1500, landValue: 900, constructionValue: 600, createdAt: new Date().toISOString() },
      { parcelId: 'p3', totalValue: 800, landValue: 500, constructionValue: 300, createdAt: new Date().toISOString() },
    ]),
  };
  const monitoringService: any = {
    list: jest.fn().mockResolvedValue([
      { stage: 'TRIAGEM', severity: 'ALTA', createdAt: new Date().toISOString() },
      { stage: 'DESFECHO', severity: 'CRITICA', createdAt: new Date().toISOString() },
      { stage: 'INGESTAO', severity: 'MEDIA', createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
    ]),
  };
  const projectsService: any = { resolveProjectId: jest.fn().mockResolvedValue('proj-1') };
  const cacheService: any = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
  const service = new ObservatoryService(parcelsService, valuationsService, monitoringService, projectsService, cacheService);

  it('builds comparative market overview', async () => {
    const result = (await service.marketOverview('tenant', 'proj-1', 'arrecadacao')) as any;
    expect(result.summary.parcelas).toBe(3);
    expect(result.discrepancyCards[0].pendentes).toBeGreaterThanOrEqual(1);
    expect(result.monitoringSummary.altaCriticidade).toBe(2);
    expect(result.summary.variacaoValor30d).toBeDefined();
    expect(result.byNeighborhood[0].neighborhood).toBeDefined();
    expect(result.byStreet[0].street).toBeDefined();
    expect(result.coverage.valuationCoverage).toBeGreaterThan(0);
    expect(result.comparativeBreakdown.length).toBeGreaterThan(0);
  });

  it('builds zone comparative breakdown when compare=zone', async () => {
    const result = (await service.marketOverview('tenant', 'proj-1', 'planejamento', {
      compare: 'zone',
    })) as any;
    expect(result.comparativeBreakdown[0].scope).toBe('ZONE');
    expect(result.comparativeBreakdown.some((item: any) => item.label === 'Z1')).toBe(true);
  });

  it('exports comparative market csv', async () => {
    const result = (await service.exportMarketCsv('tenant', 'proj-1', 'arrecadacao')) as any;
    expect(result.fileName).toMatch(/\.csv$/);
    expect(result.csv).toContain('SUMMARY');
    expect(result.csv).toContain('NEIGHBORHOOD');
  });

  it('exports zone comparison rows when compare=zone', async () => {
    const result = (await service.exportMarketCsv('tenant', 'proj-1', 'arrecadacao', {
      compare: 'zone',
    })) as any;
    expect(result.csv).toContain('ZONE');
  });
});
