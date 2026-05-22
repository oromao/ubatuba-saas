import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ParcelsService } from '../ctm/parcels/parcels.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { ProjectsService } from '../projects/projects.service';
import { ValuationsService } from '../pgv/valuations/valuations.service';
import { CacheService } from '../shared/cache.service';

type MarketFilter = {
  neighborhood?: string;
  street?: string;
  zoneId?: string;
  compare?: 'all' | 'city' | 'zone' | 'street';
};

type ComparativeRow = {
  scope: 'CITY' | 'ZONE' | 'STREET' | 'NEIGHBORHOOD';
  label: string;
  totalParcels: number;
  totalValuations: number;
  avgValue: number;
  totalValue: number;
  pendingParcels: number;
  conflictParcels: number;
  approvedParcels: number;
  criticalMonitoringEvents: number;
};

@Injectable()
export class ObservatoryService {
  constructor(
    private readonly parcelsService: ParcelsService,
    private readonly valuationsService: ValuationsService,
    private readonly monitoringService: MonitoringService,
    private readonly projectsService: ProjectsService,
    private readonly cacheService: CacheService,
  ) {}

  private normalizeText(value?: string | null) {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  private getNeighborhood(parcel: any) {
    return (
      parcel.enderecoPrincipal?.bairro ??
      parcel.neighborhood ??
      parcel.bairro ??
      parcel.mainNeighborhood ??
      'SEM_BAIRRO'
    );
  }

  private getStreet(parcel: any) {
    return (
      parcel.enderecoPrincipal?.logradouro ??
      parcel.mainAddress ??
      parcel.street ??
      parcel.logradouro ??
      'SEM_LOGRADOURO'
    );
  }

  private buildCsv(rows: Array<Record<string, unknown>>) {
    const headers = [
      'scope',
      'label',
      'totalParcels',
      'totalValuations',
      'avgValue',
      'totalValue',
      'pendingParcels',
      'conflictParcels',
      'criticalMonitoringEvents',
      'trendVariation30d',
    ];
    const escape = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const text = String(value).replace(/"/g, '""');
      return /[",;\n]/.test(text) ? `"${text}"` : text;
    };
    return [headers.join(';'), ...rows.map((row) => headers.map((h) => escape(row[h])).join(';'))].join('\n');
  }

  private buildComparativeRows(
    compare: MarketFilter['compare'],
    parcels: any[],
    valuations: any[],
    events: any[],
  ): ComparativeRow[] {
    const parcelGroups = new Map<string, any[]>();
    const valuationGroups = new Map<string, any[]>();

    const resolveGroup = (parcel: any) => {
      if (compare === 'city') return { scope: 'CITY' as const, label: 'Cidade' };
      if (compare === 'zone') return { scope: 'ZONE' as const, label: String(parcel.zoneId ?? 'SEM_ZONA') };
      if (compare === 'street') return { scope: 'STREET' as const, label: String(this.getStreet(parcel)) };
      return { scope: 'NEIGHBORHOOD' as const, label: String(this.getNeighborhood(parcel)) };
    };

    for (const parcel of parcels) {
      const group = resolveGroup(parcel);
      const key = `${group.scope}:${group.label}`;
      const rows = parcelGroups.get(key) ?? [];
      rows.push(parcel);
      parcelGroups.set(key, rows);
    }

    for (const valuation of valuations) {
      const parcel = parcels.find((item: any) => String(item.id) === String(valuation.parcelId));
      if (!parcel) continue;
      const group = resolveGroup(parcel);
      const key = `${group.scope}:${group.label}`;
      const rows = valuationGroups.get(key) ?? [];
      rows.push(valuation);
      valuationGroups.set(key, rows);
    }

    const criticalEvents = events.filter((item: any) => item.severity === 'ALTA' || item.severity === 'CRITICA').length;
    return Array.from(parcelGroups.entries())
      .map(([key, groupedParcels]) => {
        const [scope, label] = key.split(':');
        const groupedValuations = valuationGroups.get(key) ?? [];
        const totalValue = groupedValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
        const avgValue = groupedValuations.length ? totalValue / groupedValuations.length : 0;
        const pendingParcels = groupedParcels.filter((item: any) => String(item.workflowStatus ?? 'PENDENTE') === 'PENDENTE').length;
        const conflictParcels = groupedParcels.filter((item: any) => {
          const workflow = String(item.workflowStatus ?? '');
          return workflow === 'CONFLITO' || workflow === 'REPROVADA';
        }).length;
        const approvedParcels = groupedParcels.filter((item: any) => String(item.workflowStatus ?? '') === 'APROVADA').length;
        return {
          scope: scope as ComparativeRow['scope'],
          label,
          totalParcels: groupedParcels.length,
          totalValuations: groupedValuations.length,
          avgValue,
          totalValue,
          pendingParcels,
          conflictParcels,
          approvedParcels,
          criticalMonitoringEvents: criticalEvents,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue || b.totalParcels - a.totalParcels)
      .slice(0, 10);
  }

  async marketOverview(tenantId: string, projectId?: string, focus?: string, filters?: MarketFilter) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const cacheKey = `observatory:${tenantId}:${resolvedProjectId}:market:${focus ?? 'default'}:${filters?.neighborhood ?? 'any'}:${filters?.street ?? 'any'}:${filters?.zoneId ?? 'any'}:${filters?.compare ?? 'all'}`;
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const [parcels, valuations] = await Promise.all([
      this.parcelsService.list(tenantId, String(resolvedProjectId)),
      this.valuationsService.list(tenantId, String(resolvedProjectId)),
    ]);
    const events = await this.monitoringService.list(tenantId);
    const normalizedNeighborhood = this.normalizeText(filters?.neighborhood);
    const normalizedStreet = this.normalizeText(filters?.street);
    const normalizedZoneId = this.normalizeText(filters?.zoneId);

    const filteredParcels = parcels.filter((parcel: any) => {
      const neighborhood = this.normalizeText(this.getNeighborhood(parcel));
      const street = this.normalizeText(this.getStreet(parcel));
      const zoneId = this.normalizeText(parcel.zoneId ? String(parcel.zoneId) : null);
      if (normalizedNeighborhood && !neighborhood.includes(normalizedNeighborhood)) return false;
      if (normalizedStreet && !street.includes(normalizedStreet)) return false;
      if (normalizedZoneId && zoneId !== normalizedZoneId) return false;
      return true;
    });

    const filteredParcelIds = new Set(filteredParcels.map((parcel: any) => String(parcel.id)));
    const filteredValuations = valuations.filter((item: any) => filteredParcelIds.has(String(item.parcelId)));

    const totalValue = filteredValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
    const avgValue = filteredValuations.length ? totalValue / filteredValuations.length : 0;
    const currentWindowDays = 30;
    const now = Date.now();
    const currentCutoff = now - currentWindowDays * 24 * 60 * 60 * 1000;
    const previousCutoff = now - currentWindowDays * 2 * 24 * 60 * 60 * 1000;
    const zoneCounts = filteredParcels.reduce((acc, parcel: any) => {
      const key = String(parcel.zoneId ?? 'SEM_ZONA');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const neighborhoodCounts = filteredParcels.reduce((acc, parcel: any) => {
      const key = String(this.getNeighborhood(parcel));
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const streetCounts = filteredParcels.reduce((acc, parcel: any) => {
      const key = String(this.getStreet(parcel));
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const parcelByZone = filteredParcels.reduce((acc, parcel: any) => {
      const key = String(parcel.zoneId ?? 'SEM_ZONA');
      const workflow = String(parcel.workflowStatus ?? 'PENDENTE');
      if (!acc[key]) acc[key] = { total: 0, pending: 0, approved: 0, conflict: 0 };
      acc[key].total += 1;
      if (workflow === 'PENDENTE') acc[key].pending += 1;
      if (workflow === 'APROVADA') acc[key].approved += 1;
      if (workflow === 'CONFLITO' || workflow === 'REPROVADA') acc[key].conflict += 1;
      return acc;
    }, {} as Record<string, { total: number; pending: number; approved: number; conflict: number }>);

    const currentValuations = filteredValuations.filter((item: any) => {
      const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
      return created >= currentCutoff;
    });
    const previousValuations = filteredValuations.filter((item: any) => {
      const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
      return created < currentCutoff && created >= previousCutoff;
    });
    const currentValue = currentValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
    const previousValue = previousValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
    const variation = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : currentValue > 0 ? 100 : 0;
    const eventWindowDays = 30;
    const eventCurrentCutoff = now - eventWindowDays * 24 * 60 * 60 * 1000;
    const eventPreviousCutoff = now - eventWindowDays * 2 * 24 * 60 * 60 * 1000;
    const currentEvents = events.filter((item: any) => {
      const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
      return created >= eventCurrentCutoff;
    });
    const previousEvents = events.filter((item: any) => {
      const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
      return created < eventCurrentCutoff && created >= eventPreviousCutoff;
    });
    const monitoringSummary = {
      total: events.length,
      triagem: events.filter((item: any) => item.stage === 'TRIAGEM').length,
      fiscalizacao: events.filter((item: any) => item.stage === 'FISCALIZACAO').length,
      desfecho: events.filter((item: any) => item.stage === 'DESFECHO').length,
      altaCriticidade: events.filter((item: any) => item.severity === 'ALTA' || item.severity === 'CRITICA').length,
      currentWindow: currentEvents.length,
      previousWindow: previousEvents.length,
      variation: previousEvents.length > 0 ? ((currentEvents.length - previousEvents.length) / previousEvents.length) * 100 : currentEvents.length > 0 ? 100 : 0,
    };

    const topValuations = [...filteredValuations]
      .sort((a, b) => Number(b.totalValue ?? 0) - Number(a.totalValue ?? 0))
      .slice(0, 5)
      .map((item) => ({
        parcelId: String(item.parcelId),
        totalValue: Number(item.totalValue ?? 0),
        landValue: Number(item.landValue ?? 0),
        constructionValue: Number(item.constructionValue ?? 0),
      }));

    const comparativeBreakdown = this.buildComparativeRows(filters?.compare ?? 'all', filteredParcels, filteredValuations, currentEvents);
    const valuationCoverage = filteredParcels.length ? (filteredValuations.length / filteredParcels.length) * 100 : 0;
    const pendingRate = filteredParcels.length
      ? (filteredParcels.filter((item: any) => String(item.workflowStatus ?? 'PENDENTE') === 'PENDENTE').length / filteredParcels.length) * 100
      : 0;
    const conflictRate = filteredParcels.length
      ? (filteredParcels.filter((item: any) => ['CONFLITO', 'REPROVADA'].includes(String(item.workflowStatus ?? ''))).length / filteredParcels.length) * 100
      : 0;

    const result = {
      summary: {
        parcelas: filteredParcels.length,
        avaliacoes: filteredValuations.length,
        valorMedioVenal: avgValue,
        valorTotalVenal: totalValue,
        variacaoValor30d: variation,
      },
      coverage: {
        valuationCoverage,
        pendingRate,
        conflictRate,
      },
      concentration: Object.entries(zoneCounts)
        .map(([zoneId, count]) => ({ zoneId, count }))
        .sort((a, b) => b.count - a.count),
      byNeighborhood: Object.entries(neighborhoodCounts)
        .map(([neighborhood, count]) => ({ neighborhood, count }))
        .sort((a, b) => b.count - a.count),
      byStreet: Object.entries(streetCounts)
        .map(([street, count]) => ({ street, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      discrepancyCards: Object.entries(parcelByZone)
        .map(([zoneId, metrics]) => ({
          zoneId,
          total: metrics.total,
          pendentes: metrics.pending,
          conflitos: metrics.conflict,
          aprovadas: metrics.approved,
        }))
        .sort((a, b) => b.pendentes - a.pendentes),
      monitoringSummary,
      topValuations,
      comparativeBreakdown,
      indicators: [
        { label: 'Parcelas com avaliação', value: filteredValuations.length },
        { label: 'Zonas ativas', value: Object.keys(zoneCounts).length },
        { label: 'Valor médio', value: avgValue },
        { label: 'Eventos críticos', value: monitoringSummary.altaCriticidade },
        { label: 'Bairros ativos', value: Object.keys(neighborhoodCounts).length },
      ],
      trend: {
        currentWindowDays,
        currentValue,
        previousValue,
        variation,
      },
      operationalNarrative: {
        arrecadacao: totalValue > 0 ? 'Base monetaria ativa para revisao de PGV e fiscalizacao.' : 'Sem base monetaria filtrada para o recorte.',
        fiscalizacao:
          monitoringSummary.altaCriticidade > 0
            ? 'Eventos criticamente relevantes demandam triagem e fiscalizacao.'
            : 'Sem eventos criticos no recorte atual.',
        planejamento:
          Object.keys(zoneCounts).length > 1
            ? 'Distribuicao territorial heterogenea sugere leitura por zona.'
            : 'Recorte territorial ainda concentrado.',
      },
      scope: {
        compare: filters?.compare ?? 'all',
        neighborhood: filters?.neighborhood ?? null,
        street: filters?.street ?? null,
        zoneId: filters?.zoneId ?? null,
      },
    };
    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }

  async exportMarketCsv(tenantId: string, projectId?: string, focus?: string, filters?: MarketFilter) {
    const overview = (await this.marketOverview(tenantId, projectId, focus, filters)) as any;
    const rows = [
      {
        scope: 'SUMMARY',
        label: 'TOTAL',
        totalParcels: overview.summary.parcelas,
        totalValuations: overview.summary.avaliacoes,
        avgValue: overview.summary.valorMedioVenal,
        totalValue: overview.summary.valorTotalVenal,
        pendingParcels: overview.discrepancyCards.reduce((acc: number, item: any) => acc + item.pendentes, 0),
        conflictParcels: overview.discrepancyCards.reduce((acc: number, item: any) => acc + item.conflitos, 0),
        criticalMonitoringEvents: overview.monitoringSummary.altaCriticidade,
        trendVariation30d: overview.trend.variation,
      },
      ...overview.comparativeBreakdown.map((item: any) => ({
        scope: item.scope,
        label: item.label,
        totalParcels: item.totalParcels,
        totalValuations: item.totalValuations,
        avgValue: item.avgValue,
        totalValue: item.totalValue,
        pendingParcels: item.pendingParcels,
        conflictParcels: item.conflictParcels,
        criticalMonitoringEvents: item.criticalMonitoringEvents,
        trendVariation30d: overview.trend.variation,
      })),
      ...overview.byNeighborhood.slice(0, 10).map((item: any) => ({
        scope: 'NEIGHBORHOOD',
        label: item.neighborhood,
        totalParcels: item.count,
        totalValuations: 0,
        avgValue: 0,
        totalValue: 0,
        pendingParcels: 0,
        conflictParcels: 0,
        criticalMonitoringEvents: overview.monitoringSummary.altaCriticidade,
        trendVariation30d: overview.trend.variation,
      })),
      ...overview.byStreet.slice(0, 10).map((item: any) => ({
        scope: 'STREET',
        label: item.street,
        totalParcels: item.count,
        totalValuations: 0,
        avgValue: 0,
        totalValue: 0,
        pendingParcels: 0,
        conflictParcels: 0,
        criticalMonitoringEvents: overview.monitoringSummary.altaCriticidade,
        trendVariation30d: overview.trend.variation,
      })),
    ];
    const csv = this.buildCsv(rows);
    return {
      fileName: `observatory_${String(randomUUID()).slice(0, 8)}.csv`,
      contentType: 'text/csv; charset=utf-8',
      csv,
      summary: overview.summary,
    };
  }
}
