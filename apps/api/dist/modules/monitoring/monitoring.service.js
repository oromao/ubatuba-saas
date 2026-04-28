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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const alerts_service_1 = require("../alerts/alerts.service");
const cache_service_1 = require("../shared/cache.service");
const monitoring_repository_1 = require("./monitoring.repository");
let MonitoringService = class MonitoringService {
    constructor(repository, alertsService, cacheService) {
        this.repository = repository;
        this.alertsService = alertsService;
        this.cacheService = cacheService;
        this.transitionMap = {
            INGESTAO: ['TRIAGEM', 'EVIDENCIA'],
            TRIAGEM: ['FISCALIZACAO', 'EVIDENCIA', 'NOTIFICACAO', 'DESFECHO'],
            FISCALIZACAO: ['EVIDENCIA', 'NOTIFICACAO', 'DESFECHO'],
            EVIDENCIA: ['FISCALIZACAO', 'NOTIFICACAO', 'DESFECHO'],
            NOTIFICACAO: ['FISCALIZACAO', 'DESFECHO'],
            DESFECHO: [],
        };
    }
    list(tenantId, filters) {
        return this.repository.list(tenantId, filters);
    }
    findById(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async ingest(tenantId, dto, actorId) {
        const event = await this.repository.create({
            tenantId: tenantId,
            type: dto.type,
            title: dto.title,
            severity: dto.severity,
            stage: 'INGESTAO',
            classification: dto.classification,
            location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
            evidenceKeys: dto.evidenceKeys ?? [],
            source: dto.source,
            sourceMode: dto.sourceMode ?? 'MANUAL',
            sourceAdapter: dto.sourceAdapter,
            externalReference: dto.externalReference,
            observedAt: dto.observedAt ?? new Date().toISOString(),
            assignedTo: dto.source,
            timeline: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    stage: 'INGESTAO',
                    message: 'Evento ambiental ingerido',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
        });
        await this.alertsService.create(tenantId, {
            title: dto.title,
            level: dto.severity,
            lat: dto.lat,
            lng: dto.lng,
            assignedTo: dto.source,
            evidenceKeys: dto.evidenceKeys,
        });
        await this.cacheService.invalidateByPrefix(`monitoring:${tenantId}`);
        return event;
    }
    ensureTransition(currentStage, nextStage) {
        if (currentStage === nextStage)
            return;
        const allowed = this.transitionMap[currentStage] ?? [];
        if (!allowed.includes(nextStage)) {
            throw new common_1.BadRequestException(`Transicao invalida: ${currentStage} -> ${nextStage}`);
        }
    }
    async advance(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Evento nao encontrado');
        const nextStage = dto.stage ?? (dto.evidenceKey ? 'EVIDENCIA' : undefined);
        if (nextStage) {
            this.ensureTransition(current.stage, nextStage);
            current.stage = nextStage;
            current.timeline.unshift({
                id: (0, crypto_1.randomUUID)(),
                stage: nextStage,
                message: dto.message ?? `Status alterado para ${nextStage}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
            if (nextStage === 'DESFECHO') {
                current.resolvedAt = new Date().toISOString();
            }
            if (nextStage === 'NOTIFICACAO') {
                current.notifiedAt = new Date().toISOString();
            }
        }
        else if (dto.stage) {
            current.stage = dto.stage;
            current.timeline.unshift({
                id: (0, crypto_1.randomUUID)(),
                stage: dto.stage,
                message: dto.message ?? `Status alterado para ${dto.stage}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        if (dto.assignedTo) {
            current.assignedTo = dto.assignedTo;
            current.timeline.unshift({
                id: (0, crypto_1.randomUUID)(),
                stage: current.stage,
                message: `Atribuido para ${dto.assignedTo}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        if (dto.evidenceKey) {
            current.evidenceKeys = Array.from(new Set([...(current.evidenceKeys ?? []), dto.evidenceKey]));
            current.timeline.unshift({
                id: (0, crypto_1.randomUUID)(),
                stage: current.stage,
                message: `Evidencia anexada: ${dto.evidenceKey}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        if (dto.sourceAdapter) {
            current.sourceAdapter = dto.sourceAdapter;
        }
        await this.cacheService.invalidateByPrefix(`monitoring:${tenantId}`);
        return current.save();
    }
    async triage(tenantId, id, dto, actorId) {
        return this.advance(tenantId, id, { ...dto, stage: 'TRIAGEM' }, actorId);
    }
    async assign(tenantId, id, assignedTo, actorId) {
        return this.advance(tenantId, id, { stage: 'FISCALIZACAO', assignedTo }, actorId);
    }
    async notify(tenantId, id, dto, actorId) {
        return this.advance(tenantId, id, { ...dto, stage: 'NOTIFICACAO' }, actorId);
    }
    async close(tenantId, id, dto, actorId) {
        return this.advance(tenantId, id, { ...dto, stage: 'DESFECHO' }, actorId);
    }
    async dashboard(tenantId, filters) {
        const items = await this.repository.list(tenantId, filters);
        const sourceBreakdown = items.reduce((acc, item) => {
            const key = String(item.source ?? 'SEM_FONTE');
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const typeBreakdown = items.reduce((acc, item) => {
            const key = String(item.type ?? 'SEM_TIPO');
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const sourceModeBreakdown = items.reduce((acc, item) => {
            const key = String(item.sourceMode ?? 'MANUAL');
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        const recentTimeline = [...items]
            .sort((a, b) => {
            const aAny = a;
            const bAny = b;
            return Number(new Date(bAny.updatedAt ?? bAny.createdAt ?? 0)) - Number(new Date(aAny.updatedAt ?? aAny.createdAt ?? 0));
        })
            .slice(0, 5)
            .map((item) => ({
            id: item.id,
            title: item.title,
            stage: item.stage,
            severity: item.severity,
            source: item.source ?? 'SEM_FONTE',
            resolvedAt: item.resolvedAt ?? null,
        }));
        return {
            total: items.length,
            triagem: items.filter((item) => item.stage === 'TRIAGEM').length,
            fiscalizacao: items.filter((item) => item.stage === 'FISCALIZACAO').length,
            notificacao: items.filter((item) => item.stage === 'NOTIFICACAO').length,
            desfecho: items.filter((item) => item.stage === 'DESFECHO').length,
            criticidadeAlta: items.filter((item) => item.severity === 'ALTA' || item.severity === 'CRITICA').length,
            comEvidencia: items.filter((item) => (item.evidenceKeys?.length ?? 0) > 0).length,
            semAtribuicao: items.filter((item) => !item.assignedTo).length,
            notificados: items.filter((item) => Boolean(item.notifiedAt)).length,
            sourceBreakdown: Object.entries(sourceBreakdown)
                .map(([source, total]) => ({ source, total }))
                .sort((a, b) => b.total - a.total),
            typeBreakdown: Object.entries(typeBreakdown)
                .map(([type, total]) => ({ type, total }))
                .sort((a, b) => b.total - a.total),
            sourceModeBreakdown: Object.entries(sourceModeBreakdown)
                .map(([sourceMode, total]) => ({ sourceMode, total }))
                .sort((a, b) => b.total - a.total),
            feedAdapters: [
                { adapter: 'CEMADEN', mode: 'API', status: 'READY_FOR_INTEGRATION' },
                { adapter: 'INMET', mode: 'API', status: 'READY_FOR_INTEGRATION' },
                { adapter: 'INPE', mode: 'SATELLITE', status: 'READY_FOR_INTEGRATION' },
            ],
            recentTimeline,
        };
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_repository_1.MonitoringRepository,
        alerts_service_1.AlertsService,
        cache_service_1.CacheService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map