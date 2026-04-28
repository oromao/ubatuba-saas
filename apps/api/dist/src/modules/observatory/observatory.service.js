"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservatoryService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const parcels_service_1 = require("../ctm/parcels/parcels.service");
const monitoring_service_1 = require("../monitoring/monitoring.service");
const projects_service_1 = require("../projects/projects.service");
const valuations_service_1 = require("../pgv/valuations/valuations.service");
const cache_service_1 = require("../shared/cache.service");
let ObservatoryService = class ObservatoryService {
    constructor(parcelsService, valuationsService, monitoringService, projectsService, cacheService) {
        this.parcelsService = parcelsService;
        this.valuationsService = valuationsService;
        this.monitoringService = monitoringService;
        this.projectsService = projectsService;
        this.cacheService = cacheService;
    }
    normalizeText(value) {
        return String(value ?? '')
            .trim()
            .toLowerCase();
    }
    getNeighborhood(parcel) {
        return (parcel.enderecoPrincipal?.bairro ??
            parcel.neighborhood ??
            parcel.bairro ??
            parcel.mainNeighborhood ??
            'SEM_BAIRRO');
    }
    getStreet(parcel) {
        return (parcel.enderecoPrincipal?.logradouro ??
            parcel.mainAddress ??
            parcel.street ??
            parcel.logradouro ??
            'SEM_LOGRADOURO');
    }
    buildCsv(rows) {
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
        const escape = (value) => {
            if (value === null || value === undefined)
                return '';
            const text = String(value).replace(/"/g, '""');
            return /[",;\n]/.test(text) ? `"${text}"` : text;
        };
        return [headers.join(';'), ...rows.map((row) => headers.map((h) => escape(row[h])).join(';'))].join('\n');
    }
    buildComparativeRows(compare, parcels, valuations, events) {
        const parcelGroups = new Map();
        const valuationGroups = new Map();
        const resolveGroup = (parcel) => {
            if (compare === 'city')
                return { scope: 'CITY', label: 'Cidade' };
            if (compare === 'zone')
                return { scope: 'ZONE', label: String(parcel.zoneId ?? 'SEM_ZONA') };
            if (compare === 'street')
                return { scope: 'STREET', label: String(this.getStreet(parcel)) };
            return { scope: 'NEIGHBORHOOD', label: String(this.getNeighborhood(parcel)) };
        };
        for (const parcel of parcels) {
            const group = resolveGroup(parcel);
            const key = `${group.scope}:${group.label}`;
            const rows = parcelGroups.get(key) ?? [];
            rows.push(parcel);
            parcelGroups.set(key, rows);
        }
        for (const valuation of valuations) {
            const parcel = parcels.find((item) => String(item.id) === String(valuation.parcelId));
            if (!parcel)
                continue;
            const group = resolveGroup(parcel);
            const key = `${group.scope}:${group.label}`;
            const rows = valuationGroups.get(key) ?? [];
            rows.push(valuation);
            valuationGroups.set(key, rows);
        }
        const criticalEvents = events.filter((item) => item.severity === 'ALTA' || item.severity === 'CRITICA').length;
        return Array.from(parcelGroups.entries())
            .map(([key, groupedParcels]) => {
            const [scope, label] = key.split(':');
            const groupedValuations = valuationGroups.get(key) ?? [];
            const totalValue = groupedValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
            const avgValue = groupedValuations.length ? totalValue / groupedValuations.length : 0;
            const pendingParcels = groupedParcels.filter((item) => String(item.workflowStatus ?? 'PENDENTE') === 'PENDENTE').length;
            const conflictParcels = groupedParcels.filter((item) => {
                const workflow = String(item.workflowStatus ?? '');
                return workflow === 'CONFLITO' || workflow === 'REPROVADA';
            }).length;
            const approvedParcels = groupedParcels.filter((item) => String(item.workflowStatus ?? '') === 'APROVADA').length;
            return {
                scope: scope,
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
    async marketOverview(tenantId, projectId, focus, filters) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const cacheKey = `observatory:${tenantId}:${resolvedProjectId}:market:${focus ?? 'default'}:${filters?.neighborhood ?? 'any'}:${filters?.street ?? 'any'}:${filters?.zoneId ?? 'any'}:${filters?.compare ?? 'all'}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const [parcels, valuations] = await Promise.all([
            this.parcelsService.list(tenantId, String(resolvedProjectId)),
            this.valuationsService.list(tenantId, String(resolvedProjectId)),
        ]);
        const events = await this.monitoringService.list(tenantId);
        const normalizedNeighborhood = this.normalizeText(filters?.neighborhood);
        const normalizedStreet = this.normalizeText(filters?.street);
        const normalizedZoneId = this.normalizeText(filters?.zoneId);
        const filteredParcels = parcels.filter((parcel) => {
            const neighborhood = this.normalizeText(this.getNeighborhood(parcel));
            const street = this.normalizeText(this.getStreet(parcel));
            const zoneId = this.normalizeText(parcel.zoneId ? String(parcel.zoneId) : null);
            if (normalizedNeighborhood && !neighborhood.includes(normalizedNeighborhood))
                return false;
            if (normalizedStreet && !street.includes(normalizedStreet))
                return false;
            if (normalizedZoneId && zoneId !== normalizedZoneId)
                return false;
            return true;
        });
        const filteredParcelIds = new Set(filteredParcels.map((parcel) => String(parcel.id)));
        const filteredValuations = valuations.filter((item) => filteredParcelIds.has(String(item.parcelId)));
        const parcelMap = new Map(filteredParcels.map((parcel) => [String(parcel.id), parcel]));
        const totalValue = filteredValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
        const avgValue = filteredValuations.length ? totalValue / filteredValuations.length : 0;
        const currentWindowDays = 30;
        const now = Date.now();
        const currentCutoff = now - currentWindowDays * 24 * 60 * 60 * 1000;
        const previousCutoff = now - currentWindowDays * 2 * 24 * 60 * 60 * 1000;
        const zoneCounts = filteredParcels.reduce((acc, parcel) => {
            const key = String(parcel.zoneId ?? 'SEM_ZONA');
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const neighborhoodCounts = filteredParcels.reduce((acc, parcel) => {
            const key = String(this.getNeighborhood(parcel));
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const streetCounts = filteredParcels.reduce((acc, parcel) => {
            const key = String(this.getStreet(parcel));
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const parcelByZone = filteredParcels.reduce((acc, parcel) => {
            const key = String(parcel.zoneId ?? 'SEM_ZONA');
            const workflow = String(parcel.workflowStatus ?? 'PENDENTE');
            if (!acc[key])
                acc[key] = { total: 0, pending: 0, approved: 0, conflict: 0 };
            acc[key].total += 1;
            if (workflow === 'PENDENTE')
                acc[key].pending += 1;
            if (workflow === 'APROVADA')
                acc[key].approved += 1;
            if (workflow === 'CONFLITO' || workflow === 'REPROVADA')
                acc[key].conflict += 1;
            return acc;
        }, {});
        const currentValuations = filteredValuations.filter((item) => {
            const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
            return created >= currentCutoff;
        });
        const previousValuations = filteredValuations.filter((item) => {
            const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
            return created < currentCutoff && created >= previousCutoff;
        });
        const currentValue = currentValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
        const previousValue = previousValuations.reduce((acc, item) => acc + Number(item.totalValue ?? 0), 0);
        const variation = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : currentValue > 0 ? 100 : 0;
        const eventWindowDays = 30;
        const eventCurrentCutoff = now - eventWindowDays * 24 * 60 * 60 * 1000;
        const eventPreviousCutoff = now - eventWindowDays * 2 * 24 * 60 * 60 * 1000;
        const currentEvents = events.filter((item) => {
            const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
            return created >= eventCurrentCutoff;
        });
        const previousEvents = events.filter((item) => {
            const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
            return created < eventCurrentCutoff && created >= eventPreviousCutoff;
        });
        const monitoringSummary = {
            total: events.length,
            triagem: events.filter((item) => item.stage === 'TRIAGEM').length,
            fiscalizacao: events.filter((item) => item.stage === 'FISCALIZACAO').length,
            desfecho: events.filter((item) => item.stage === 'DESFECHO').length,
            altaCriticidade: events.filter((item) => item.severity === 'ALTA' || item.severity === 'CRITICA').length,
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
            ? (filteredParcels.filter((item) => String(item.workflowStatus ?? 'PENDENTE') === 'PENDENTE').length / filteredParcels.length) * 100
            : 0;
        const conflictRate = filteredParcels.length
            ? (filteredParcels.filter((item) => ['CONFLITO', 'REPROVADA'].includes(String(item.workflowStatus ?? ''))).length / filteredParcels.length) * 100
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
                fiscalizacao: monitoringSummary.altaCriticidade > 0
                    ? 'Eventos criticamente relevantes demandam triagem e fiscalizacao.'
                    : 'Sem eventos criticos no recorte atual.',
                planejamento: Object.keys(zoneCounts).length > 1
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
    async exportMarketCsv(tenantId, projectId, focus, filters) {
        const overview = (await this.marketOverview(tenantId, projectId, focus, filters));
        const rows = [
            {
                scope: 'SUMMARY',
                label: 'TOTAL',
                totalParcels: overview.summary.parcelas,
                totalValuations: overview.summary.avaliacoes,
                avgValue: overview.summary.valorMedioVenal,
                totalValue: overview.summary.valorTotalVenal,
                pendingParcels: overview.discrepancyCards.reduce((acc, item) => acc + item.pendentes, 0),
                conflictParcels: overview.discrepancyCards.reduce((acc, item) => acc + item.conflitos, 0),
                criticalMonitoringEvents: overview.monitoringSummary.altaCriticidade,
                trendVariation30d: overview.trend.variation,
            },
            ...overview.comparativeBreakdown.map((item) => ({
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
            ...overview.byNeighborhood.slice(0, 10).map((item) => ({
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
            ...overview.byStreet.slice(0, 10).map((item) => ({
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
            fileName: `observatory_${String((0, crypto_1.randomUUID)()).slice(0, 8)}.csv`,
            contentType: 'text/csv; charset=utf-8',
            csv,
            summary: overview.summary,
        };
    }
};
exports.ObservatoryService = ObservatoryService;
exports.ObservatoryService = ObservatoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService,
        valuations_service_1.ValuationsService,
        monitoring_service_1.MonitoringService,
        projects_service_1.ProjectsService,
        cache_service_1.CacheService])
], ObservatoryService);
//# sourceMappingURL=observatory.service.js.map