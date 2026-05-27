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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../shared/cache.service");
const processes_service_1 = require("../processes/processes.service");
const alerts_service_1 = require("../alerts/alerts.service");
const assets_service_1 = require("../assets/assets.service");
const permits_works_service_1 = require("../permits-works/permits-works.service");
const permits_business_service_1 = require("../permits-business/permits-business.service");
const citizen_156_service_1 = require("../citizen-156/citizen-156.service");
const environment_service_1 = require("../environment/environment.service");
const public_works_service_1 = require("../public-works/public-works.service");
const cemetery_service_1 = require("../cemetery/cemetery.service");
const parcels_service_1 = require("../ctm/parcels/parcels.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dashboard_layout_schema_1 = require("./dashboard-layout.schema");
const object_id_1 = require("../../common/utils/object-id");
let DashboardService = class DashboardService {
    constructor(processesService, alertsService, assetsService, permitsWorksService, permitsBusinessService, citizen156Service, environmentService, publicWorksService, cemeteryService, parcelsService, cacheService, layoutModel) {
        this.processesService = processesService;
        this.alertsService = alertsService;
        this.assetsService = assetsService;
        this.permitsWorksService = permitsWorksService;
        this.permitsBusinessService = permitsBusinessService;
        this.citizen156Service = citizen156Service;
        this.environmentService = environmentService;
        this.publicWorksService = publicWorksService;
        this.cemeteryService = cemeteryService;
        this.parcelsService = parcelsService;
        this.cacheService = cacheService;
        this.layoutModel = layoutModel;
    }
    async getKpis(tenantId) {
        const cacheKey = `dashboard:${tenantId}:kpis`;
        try {
            let cached = null;
            try {
                cached = await this.cacheService.get(cacheKey);
            }
            catch (e) { }
            if (cached)
                return cached;
            const [processes, alerts, assets] = await Promise.all([
                this.processesService.list(tenantId).catch(() => []),
                this.alertsService.list(tenantId).catch(() => []),
                this.assetsService.list(tenantId).catch(() => []),
            ]);
            const result = {
                processes: Array.isArray(processes) ? processes.length : 0,
                alerts: Array.isArray(alerts) ? alerts.length : 0,
                assets: Array.isArray(assets) ? assets.length : 0,
            };
            try {
                await this.cacheService.set(cacheKey, result, 60);
            }
            catch (e) { }
            return result;
        }
        catch (error) {
            return {
                processes: 0,
                alerts: 0,
                assets: 0,
            };
        }
    }
    async getExecutive(tenantId, userId) {
        const cacheKey = `dashboard:${tenantId}:executive:${userId}`;
        try {
            let cached = null;
            try {
                cached = await this.cacheService.get(cacheKey);
            }
            catch (e) { }
            if (cached)
                return cached;
            const [processes, alerts, assets, works, business, calls, environmentCases, publicWorks, cemeteryPlots,] = await Promise.all([
                this.processesService.list(tenantId).catch(() => []),
                this.alertsService.list(tenantId).catch(() => []),
                this.assetsService.list(tenantId).catch(() => []),
                this.permitsWorksService.list(tenantId).catch(() => []),
                this.permitsBusinessService.list(tenantId).catch(() => []),
                this.citizen156Service.list(tenantId).catch(() => []),
                this.environmentService.list(tenantId).catch(() => []),
                this.publicWorksService.list(tenantId).catch(() => []),
                this.cemeteryService.list(tenantId).catch(() => []),
            ]);
            const parcelStats = await this.parcelsService.getStatistics(tenantId).catch(() => null);
            const result = {
                ctm: parcelStats ? {
                    totalParcelas: parcelStats.total,
                    oficiais: parcelStats.official,
                    demo: parcelStats.demo,
                    comSqlu: parcelStats.withSqlu,
                    taxaAdimplencia: parcelStats.taxaAdimplencia,
                    totalValorVenal: parcelStats.totalValorVenal,
                    totalIptuLancado: parcelStats.totalIptuLancado,
                    totalIptuPago: parcelStats.totalIptuPago,
                    totalIptuEmAberto: parcelStats.totalIptuEmAberto,
                    porStatus: parcelStats.byStatus,
                } : {
                    totalParcelas: 0,
                    oficiais: 0,
                    demo: 0,
                    comSqlu: 0,
                    taxaAdimplencia: 0,
                    totalValorVenal: 0,
                    totalIptuLancado: 0,
                    totalIptuPago: 0,
                    totalIptuEmAberto: 0,
                    porStatus: {},
                },
                summary: {
                    processos: Array.isArray(processes) ? processes.length : 0,
                    alertas: Array.isArray(alerts) ? alerts.length : 0,
                    ativos: Array.isArray(assets) ? assets.length : 0,
                    obras: Array.isArray(works) ? works.length : 0,
                    empresas: Array.isArray(business) ? business.length : 0,
                    chamados156: Array.isArray(calls) ? calls.length : 0,
                    ambientais: Array.isArray(environmentCases) ? environmentCases.length : 0,
                    obrasPublicas: Array.isArray(publicWorks) ? publicWorks.length : 0,
                    cemiterio: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0,
                },
                widgets: await this.getLayout(tenantId, userId).catch(() => ({
                    viewMode: 'executive',
                    widgets: [
                        { id: 'summary', visible: true, order: 0 },
                        { id: 'secretarias', visible: true, order: 1 },
                        { id: 'priorities', visible: true, order: 2 },
                        { id: 'satelliteHealth', visible: true, order: 3 },
                        { id: 'readinessSignals', visible: true, order: 4 },
                        { id: 'map', visible: true, order: 5 },
                        { id: 'operations', visible: true, order: 6 },
                        { id: 'integrations', visible: true, order: 7 },
                    ],
                })),
                secretarias: [
                    { name: 'Obras', total: (Array.isArray(works) ? works.length : 0) + (Array.isArray(publicWorks) ? publicWorks.length : 0), status: 'operacional' },
                    { name: 'Urbanismo', total: Array.isArray(processes) ? processes.length : 0, status: 'operacional' },
                    { name: 'Meio Ambiente', total: (Array.isArray(environmentCases) ? environmentCases.length : 0) + (Array.isArray(alerts) ? alerts.length : 0), status: 'monitoramento' },
                    { name: 'Atendimento', total: Array.isArray(calls) ? calls.length : 0, status: 'fila' },
                    { name: 'Tributário', total: Array.isArray(business) ? business.length : 0, status: 'integração' },
                    { name: 'Patrimônio', total: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0, status: 'cadastro' },
                ],
                priorities: [
                    { label: 'Obras em andamento', value: Array.isArray(publicWorks) ? publicWorks.filter((item) => item && item.status === 'EM_EXECUCAO').length : 0 },
                    { label: 'Chamados abertos', value: Array.isArray(calls) ? calls.filter((item) => item && item.status === 'ABERTO').length : 0 },
                    { label: 'Alertas em triagem', value: Array.isArray(alerts) ? alerts.filter((item) => item && item.stage === 'TRIAGEM').length : 0 },
                ],
                satelliteHealth: [
                    {
                        id: '156',
                        label: 'Atendimento 156',
                        total: Array.isArray(calls) ? calls.length : 0,
                        open: Array.isArray(calls) ? calls.filter((item) => item && item.status === 'ABERTO').length : 0,
                        inProgress: Array.isArray(calls) ? calls.filter((item) => item && (item.status === 'EM_TRIAGEM' || item.status === 'ENCAMINHADO' || item.status === 'EM_CAMPO')).length : 0,
                        closed: Array.isArray(calls) ? calls.filter((item) => item && (item.status === 'RESOLVIDO' || item.status === 'CANCELADO')).length : 0,
                    },
                    {
                        id: 'environment',
                        label: 'Ambiental',
                        total: Array.isArray(environmentCases) ? environmentCases.length : 0,
                        open: Array.isArray(environmentCases) ? environmentCases.filter((item) => item && item.status === 'ABERTO').length : 0,
                        inProgress: Array.isArray(environmentCases) ? environmentCases.filter((item) => item && (item.status === 'EM_TRIAGEM' || item.status === 'EM_CAMPO')).length : 0,
                        closed: Array.isArray(environmentCases) ? environmentCases.filter((item) => item && (item.status === 'RESOLVIDO' || item.status === 'LAUDO')).length : 0,
                    },
                    {
                        id: 'public-works',
                        label: 'Obras Públicas',
                        total: Array.isArray(publicWorks) ? publicWorks.length : 0,
                        open: Array.isArray(publicWorks) ? publicWorks.filter((item) => item && item.status === 'PLANEJADA').length : 0,
                        inProgress: Array.isArray(publicWorks) ? publicWorks.filter((item) => item && (item.status === 'EM_EXECUCAO' || item.status === 'CONTRATADA')).length : 0,
                        closed: Array.isArray(publicWorks) ? publicWorks.filter((item) => item && item.status === 'CONCLUIDA').length : 0,
                    },
                    {
                        id: 'cemetery',
                        label: 'Cemitério',
                        total: Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0,
                        open: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item) => item && item.status === 'LIVRE').length : 0,
                        inProgress: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item) => item && item.status === 'OCUPADO').length : 0,
                        closed: Array.isArray(cemeteryPlots) ? cemeteryPlots.filter((item) => item && item.status === 'INATIVO').length : 0,
                    },
                ],
                readinessSignals: [
                    { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
                    { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
                    { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
                    {
                        label: 'Satélites',
                        value: Math.max(0, Math.min(4, Math.round(((Array.isArray(calls) ? calls.length : 0) +
                            (Array.isArray(environmentCases) ? environmentCases.length : 0) +
                            (Array.isArray(publicWorks) ? publicWorks.length : 0) +
                            (Array.isArray(cemeteryPlots) ? cemeteryPlots.length : 0)) / 4))),
                        note: 'Volume operacional disponível para demo'
                    },
                ],
            };
            try {
                await this.cacheService.set(cacheKey, result, 60);
            }
            catch (e) { }
            return result;
        }
        catch (error) {
            return {
                ctm: {
                    totalParcelas: 0,
                    oficiais: 0,
                    demo: 0,
                    comSqlu: 0,
                    taxaAdimplencia: 0,
                    totalValorVenal: 0,
                    totalIptuLancado: 0,
                    totalIptuPago: 0,
                    totalIptuEmAberto: 0,
                    porStatus: {},
                },
                summary: {
                    processos: 0,
                    alertas: 0,
                    ativos: 0,
                    obras: 0,
                    empresas: 0,
                    chamados156: 0,
                    ambientais: 0,
                    obrasPublicas: 0,
                    cemiterio: 0,
                },
                widgets: {
                    viewMode: 'executive',
                    widgets: [
                        { id: 'summary', visible: true, order: 0 },
                        { id: 'secretarias', visible: true, order: 1 },
                        { id: 'priorities', visible: true, order: 2 },
                        { id: 'satelliteHealth', visible: true, order: 3 },
                        { id: 'readinessSignals', visible: true, order: 4 },
                        { id: 'map', visible: true, order: 5 },
                        { id: 'operations', visible: true, order: 6 },
                        { id: 'integrations', visible: true, order: 7 },
                    ],
                },
                secretarias: [
                    { name: 'Obras', total: 0, status: 'operacional' },
                    { name: 'Urbanismo', total: 0, status: 'operacional' },
                    { name: 'Meio Ambiente', total: 0, status: 'monitoramento' },
                    { name: 'Atendimento', total: 0, status: 'fila' },
                    { name: 'Tributário', total: 0, status: 'integração' },
                    { name: 'Patrimônio', total: 0, status: 'cadastro' },
                ],
                priorities: [
                    { label: 'Obras em andamento', value: 0 },
                    { label: 'Chamados abertos', value: 0 },
                    { label: 'Alertas em triagem', value: 0 },
                ],
                satelliteHealth: [
                    { id: '156', label: 'Atendimento 156', total: 0, open: 0, inProgress: 0, closed: 0 },
                    { id: 'environment', label: 'Ambiental', total: 0, open: 0, inProgress: 0, closed: 0 },
                    { id: 'public-works', label: 'Obras Públicas', total: 0, open: 0, inProgress: 0, closed: 0 },
                    { id: 'cemetery', label: 'Cemitério', total: 0, open: 0, inProgress: 0, closed: 0 },
                ],
                readinessSignals: [
                    { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
                    { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
                    { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
                    { label: 'Satélites', value: 0, note: 'Volume operacional disponível para demo' },
                ],
            };
        }
    }
    async getLayout(tenantId, userId) {
        const layout = await this.layoutModel.findOne({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            userId: (0, object_id_1.asObjectId)(userId),
        }).lean();
        const defaults = {
            viewMode: 'executive',
            widgets: [
                { id: 'summary', visible: true, order: 0 },
                { id: 'secretarias', visible: true, order: 1 },
                { id: 'priorities', visible: true, order: 2 },
                { id: 'satelliteHealth', visible: true, order: 3 },
                { id: 'readinessSignals', visible: true, order: 4 },
                { id: 'map', visible: true, order: 5 },
                { id: 'operations', visible: true, order: 6 },
                { id: 'integrations', visible: true, order: 7 },
            ],
        };
        return layout ?? defaults;
    }
    async saveLayout(tenantId, userId, layout) {
        return this.layoutModel.findOneAndUpdate({ tenantId: (0, object_id_1.asObjectId)(tenantId), userId: (0, object_id_1.asObjectId)(userId) }, { tenantId: (0, object_id_1.asObjectId)(tenantId), userId: (0, object_id_1.asObjectId)(userId), ...layout }, { upsert: true, new: true }).lean();
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(11, (0, mongoose_1.InjectModel)(dashboard_layout_schema_1.DashboardLayout.name)),
    __metadata("design:paramtypes", [processes_service_1.ProcessesService,
        alerts_service_1.AlertsService,
        assets_service_1.AssetsService,
        permits_works_service_1.PermitsWorksService,
        permits_business_service_1.PermitsBusinessService,
        citizen_156_service_1.Citizen156Service,
        environment_service_1.EnvironmentService,
        public_works_service_1.PublicWorksService,
        cemetery_service_1.CemeteryService,
        parcels_service_1.ParcelsService,
        cache_service_1.CacheService,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map