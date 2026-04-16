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
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dashboard_layout_schema_1 = require("./dashboard-layout.schema");
const object_id_1 = require("../../common/utils/object-id");
let DashboardService = class DashboardService {
    constructor(processesService, alertsService, assetsService, permitsWorksService, permitsBusinessService, citizen156Service, environmentService, publicWorksService, cemeteryService, cacheService, layoutModel) {
        this.processesService = processesService;
        this.alertsService = alertsService;
        this.assetsService = assetsService;
        this.permitsWorksService = permitsWorksService;
        this.permitsBusinessService = permitsBusinessService;
        this.citizen156Service = citizen156Service;
        this.environmentService = environmentService;
        this.publicWorksService = publicWorksService;
        this.cemeteryService = cemeteryService;
        this.cacheService = cacheService;
        this.layoutModel = layoutModel;
    }
    async getKpis(tenantId) {
        const cacheKey = `dashboard:${tenantId}:kpis`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const [processes, alerts, assets] = await Promise.all([
            this.processesService.list(tenantId),
            this.alertsService.list(tenantId),
            this.assetsService.list(tenantId),
        ]);
        const result = {
            processes: processes.length,
            alerts: alerts.length,
            assets: assets.length,
        };
        await this.cacheService.set(cacheKey, result, 60);
        return result;
    }
    async getExecutive(tenantId, userId) {
        const cacheKey = `dashboard:${tenantId}:executive:${userId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const [processes, alerts, assets, works, business, calls, environmentCases, publicWorks, cemeteryPlots,] = await Promise.all([
            this.processesService.list(tenantId),
            this.alertsService.list(tenantId),
            this.assetsService.list(tenantId),
            this.permitsWorksService.list(tenantId),
            this.permitsBusinessService.list(tenantId),
            this.citizen156Service.list(tenantId),
            this.environmentService.list(tenantId),
            this.publicWorksService.list(tenantId),
            this.cemeteryService.list(tenantId),
        ]);
        const result = {
            summary: {
                processos: processes.length,
                alertas: alerts.length,
                ativos: assets.length,
                obras: works.length,
                empresas: business.length,
                chamados156: calls.length,
                ambientais: environmentCases.length,
                obrasPublicas: publicWorks.length,
                cemiterio: cemeteryPlots.length,
            },
            widgets: await this.getLayout(tenantId, userId),
            secretarias: [
                { name: 'Obras', total: works.length + publicWorks.length, status: 'operacional' },
                { name: 'Urbanismo', total: processes.length, status: 'operacional' },
                { name: 'Meio Ambiente', total: environmentCases.length + alerts.length, status: 'monitoramento' },
                { name: 'Atendimento', total: calls.length, status: 'fila' },
                { name: 'Tributário', total: business.length, status: 'integração' },
                { name: 'Patrimônio', total: cemeteryPlots.length, status: 'cadastro' },
            ],
            priorities: [
                { label: 'Obras em andamento', value: publicWorks.filter((item) => item.status === 'EM_EXECUCAO').length },
                { label: 'Chamados abertos', value: calls.filter((item) => item.status === 'ABERTO').length },
                { label: 'Alertas em triagem', value: alerts.filter((item) => item.stage === 'TRIAGEM').length },
            ],
            satelliteHealth: [
                {
                    id: '156',
                    label: 'Atendimento 156',
                    total: calls.length,
                    open: calls.filter((item) => item.status === 'ABERTO').length,
                    inProgress: calls.filter((item) => item.status === 'EM_ANALISE').length,
                    closed: calls.filter((item) => item.status === 'ENCERRADO').length,
                },
                {
                    id: 'environment',
                    label: 'Ambiental',
                    total: environmentCases.length,
                    open: environmentCases.filter((item) => item.status === 'ABERTO').length,
                    inProgress: environmentCases.filter((item) => item.status === 'EM_ANALISE' || item.status === 'EM_CAMPO').length,
                    closed: environmentCases.filter((item) => item.status === 'ENCERRADO' || item.status === 'LAUDO').length,
                },
                {
                    id: 'public-works',
                    label: 'Obras Públicas',
                    total: publicWorks.length,
                    open: publicWorks.filter((item) => item.status === 'PLANEJADA').length,
                    inProgress: publicWorks.filter((item) => item.status === 'EM_EXECUCAO' || item.status === 'CONTRATADA').length,
                    closed: publicWorks.filter((item) => item.status === 'CONCLUIDA').length,
                },
                {
                    id: 'cemetery',
                    label: 'Cemitério',
                    total: cemeteryPlots.length,
                    open: cemeteryPlots.filter((item) => item.status === 'LIVRE').length,
                    inProgress: cemeteryPlots.filter((item) => item.status === 'OCUPADO').length,
                    closed: cemeteryPlots.filter((item) => item.status === 'INATIVO').length,
                },
            ],
            readinessSignals: [
                { label: 'Portal institucional', value: 1, note: 'Handoff, callback e logout prontos para demo' },
                { label: 'RBAC e tenant', value: 1, note: 'Isolamento por tenant e perfil operacional' },
                { label: 'Rastreabilidade', value: 1, note: 'Histórico em módulos críticos e fluxos de campo' },
                { label: 'Satélites', value: Math.max(0, Math.min(4, Math.round((calls.length + environmentCases.length + publicWorks.length + cemeteryPlots.length) / 4))), note: 'Volume operacional disponível para demo' },
            ],
        };
        await this.cacheService.set(cacheKey, result, 60);
        return result;
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
    __param(10, (0, mongoose_1.InjectModel)(dashboard_layout_schema_1.DashboardLayout.name)),
    __metadata("design:paramtypes", [processes_service_1.ProcessesService,
        alerts_service_1.AlertsService,
        assets_service_1.AssetsService,
        permits_works_service_1.PermitsWorksService,
        permits_business_service_1.PermitsBusinessService,
        citizen_156_service_1.Citizen156Service,
        environment_service_1.EnvironmentService,
        public_works_service_1.PublicWorksService,
        cemetery_service_1.CemeteryService,
        cache_service_1.CacheService,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map