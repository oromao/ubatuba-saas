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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../shared/cache.service");
const alerts_repository_1 = require("./alerts.repository");
const object_id_1 = require("../../common/utils/object-id");
let AlertsService = class AlertsService {
    constructor(alertsRepository, cacheService) {
        this.alertsRepository = alertsRepository;
        this.cacheService = cacheService;
    }
    list(tenantId) {
        return this.alertsRepository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.alertsRepository.findById(tenantId, id);
    }
    async create(tenantId, dto) {
        const created = await this.alertsRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            title: dto.title,
            level: dto.level,
            status: 'ABERTO',
            location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
        });
        await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto) {
        const updated = await this.alertsRepository.update(tenantId, id, dto);
        await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
        return updated;
    }
    async ack(tenantId, id) {
        const updated = await this.alertsRepository.update(tenantId, id, {
            status: 'EM_ANALISE',
        });
        await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
        return updated;
    }
    async resolve(tenantId, id) {
        const updated = await this.alertsRepository.update(tenantId, id, {
            status: 'RESOLVIDO',
        });
        await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
        return updated;
    }
    async remove(tenantId, id) {
        await this.alertsRepository.delete(tenantId, id);
        await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
        return { success: true };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alerts_repository_1.AlertsRepository,
        cache_service_1.CacheService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map