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
exports.PublicWorksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const projects_service_1 = require("../projects/projects.service");
const cache_service_1 = require("../shared/cache.service");
const object_id_1 = require("../../common/utils/object-id");
const public_works_repository_1 = require("./public-works.repository");
let PublicWorksService = class PublicWorksService {
    constructor(repository, projectsService, cacheService) {
        this.repository = repository;
        this.projectsService = projectsService;
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
        const protocolNumber = `OP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, crypto_1.randomUUID)().slice(0, 6).toUpperCase()}`;
        const created = await this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            protocolNumber,
            title: dto.title,
            department: dto.department,
            location: dto.location,
            contractor: dto.contractor,
            budget: dto.budget,
            startDate: dto.startDate,
            endDate: dto.endDate,
            status: 'PLANEJADA',
            stage: 'CADASTRO',
            progress: 0,
            evidenceKeys: [],
            measurements: [],
            history: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    status: 'PLANEJADA',
                    stage: 'CADASTRO',
                    message: 'Obra publica cadastrada',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
        });
        await this.cacheService.invalidateByPrefix(`public-works:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Obra nao encontrada');
        if (dto.contractor)
            current.contractor = dto.contractor;
        if (dto.status) {
            current.status = dto.status;
            current.history.unshift({
                id: (0, crypto_1.randomUUID)(),
                status: dto.status,
                stage: current.stage,
                message: dto.message ?? `Status alterado para ${dto.status}`,
                createdAt: new Date().toISOString(),
                actorId,
            });
        }
        return this.repository.save(current);
    }
    async advanceStage(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Obra nao encontrada');
        current.stage = dto.stage;
        if (dto.stage === 'EXECUCAO')
            current.status = 'EM_EXECUCAO';
        if (dto.stage === 'MEDICAO')
            current.status = 'CONTRATADA';
        if (dto.stage === 'ENTREGA')
            current.status = 'CONCLUIDA';
        current.history.unshift({
            id: (0, crypto_1.randomUUID)(),
            status: current.status,
            stage: dto.stage,
            message: dto.message ?? `Etapa alterada para ${dto.stage}`,
            createdAt: new Date().toISOString(),
            actorId,
        });
        return this.repository.save(current);
    }
    async addMeasurement(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Obra nao encontrada');
        current.measurements.unshift({
            id: (0, crypto_1.randomUUID)(),
            label: dto.label,
            quantity: dto.quantity,
            unit: dto.unit,
            createdAt: new Date().toISOString(),
            actorId,
        });
        current.progress = Math.min(100, current.progress + 10);
        current.stage = 'MEDICAO';
        current.history.unshift({
            id: (0, crypto_1.randomUUID)(),
            status: current.status,
            stage: 'MEDICAO',
            message: dto.message ?? `Medição registrada: ${dto.label}`,
            createdAt: new Date().toISOString(),
            actorId,
        });
        return this.repository.save(current);
    }
    async addEvidence(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Obra nao encontrada');
        current.evidenceKeys = Array.from(new Set([...(current.evidenceKeys ?? []), ...dto.keys]));
        current.stage = 'FISCALIZACAO';
        current.history.unshift({
            id: (0, crypto_1.randomUUID)(),
            status: current.status,
            stage: 'FISCALIZACAO',
            message: dto.message ?? `Evidencias anexadas (${dto.keys.length})`,
            createdAt: new Date().toISOString(),
            actorId,
        });
        return this.repository.save(current);
    }
    remove(tenantId, id) {
        return this.repository.delete(tenantId, id);
    }
    async summary(tenantId) {
        const items = await this.repository.list(tenantId);
        return {
            total: items.length,
            planejadas: items.filter((item) => item.status === 'PLANEJADA').length,
            execucao: items.filter((item) => item.status === 'EM_EXECUCAO').length,
            contratadas: items.filter((item) => item.status === 'CONTRATADA').length,
            concluidas: items.filter((item) => item.status === 'CONCLUIDA').length,
            progressoMedio: items.length
                ? items.reduce((acc, item) => acc + Number(item.progress ?? 0), 0) / items.length
                : 0,
            medicoes: items.reduce((acc, item) => acc + (item.measurements?.length ?? 0), 0),
            evidencias: items.reduce((acc, item) => acc + (item.evidenceKeys?.length ?? 0), 0),
        };
    }
};
exports.PublicWorksService = PublicWorksService;
exports.PublicWorksService = PublicWorksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [public_works_repository_1.PublicWorksRepository,
        projects_service_1.ProjectsService,
        cache_service_1.CacheService])
], PublicWorksService);
//# sourceMappingURL=public-works.service.js.map