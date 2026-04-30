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
exports.Citizen156Service = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const alerts_service_1 = require("../alerts/alerts.service");
const projects_service_1 = require("../projects/projects.service");
const cache_service_1 = require("../shared/cache.service");
const citizen_156_repository_1 = require("./citizen-156.repository");
let Citizen156Service = class Citizen156Service {
    constructor(repository, projectsService, alertsService, cacheService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.alertsService = alertsService;
        this.cacheService = cacheService;
    }
    list(tenantId) {
        return this.repository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async create(tenantId, dto, actorId) {
        const projectId = await this.projectsService.resolveProjectId(tenantId);
        const protocolNumber = `156-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, crypto_1.randomUUID)().slice(0, 6).toUpperCase()}`;
        const created = await this.repository.create({
            tenantId: tenantId,
            projectId,
            protocolNumber,
            title: dto.title,
            category: dto.category,
            status: 'ABERTO',
            reporterName: dto.reporterName,
            reporterContact: dto.reporterContact,
            processId: dto.processId,
            alertId: dto.alertId,
            attachmentKeys: dto.attachmentKeys ?? [],
            history: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    status: 'ABERTO',
                    message: 'Chamado aberto',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
        });
        if (dto.alertId) {
            await this.alertsService.advanceStage(tenantId, dto.alertId, 'NOTIFICACAO', 'Chamado 156 vinculado ao alerta');
        }
        await this.cacheService.invalidateByPrefix(`citizen-156:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Chamado nao encontrado');
        if (dto.status) {
            current.status = dto.status;
            current.history.unshift({
                id: (0, crypto_1.randomUUID)(),
                status: dto.status,
                message: dto.message ?? `Status alterado para ${dto.status}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        return this.repository.save(current);
    }
    async summary(tenantId) {
        const items = await this.repository.list(tenantId);
        return {
            total: items.length,
            abertos: items.filter((item) => item.status === 'ABERTO').length,
            triagem: items.filter((item) => item.status === 'EM_TRIAGEM').length,
            encaminhados: items.filter((item) => item.status === 'ENCAMINHADO' || item.status === 'EM_CAMPO').length,
            resolvidos: items.filter((item) => item.status === 'RESOLVIDO').length,
            anexos: items.reduce((acc, item) => acc + (item.attachmentKeys?.length ?? 0), 0),
        };
    }
    async findByProtocol(protocolNumber) {
        return this.repository.findByProtocol(protocolNumber);
    }
};
exports.Citizen156Service = Citizen156Service;
exports.Citizen156Service = Citizen156Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [citizen_156_repository_1.Citizen156Repository,
        projects_service_1.ProjectsService,
        alerts_service_1.AlertsService,
        cache_service_1.CacheService])
], Citizen156Service);
//# sourceMappingURL=citizen-156.service.js.map