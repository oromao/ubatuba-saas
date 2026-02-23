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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../shared/cache.service");
const processes_service_1 = require("../processes/processes.service");
const alerts_service_1 = require("../alerts/alerts.service");
const assets_service_1 = require("../assets/assets.service");
let DashboardService = class DashboardService {
    constructor(processesService, alertsService, assetsService, cacheService) {
        this.processesService = processesService;
        this.alertsService = alertsService;
        this.assetsService = assetsService;
        this.cacheService = cacheService;
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [processes_service_1.ProcessesService,
        alerts_service_1.AlertsService,
        assets_service_1.AssetsService,
        cache_service_1.CacheService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map