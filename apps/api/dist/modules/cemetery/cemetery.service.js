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
exports.CemeteryService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const object_id_1 = require("../../common/utils/object-id");
const cache_service_1 = require("../shared/cache.service");
const cemetery_repository_1 = require("./cemetery.repository");
let CemeteryService = class CemeteryService {
    constructor(repository, cacheService) {
        this.repository = repository;
        this.cacheService = cacheService;
    }
    list(tenantId) {
        return this.repository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.repository.findById(tenantId, id);
    }
    async create(tenantId, dto, actorId) {
        const created = await this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            cemeteryName: dto.cemeteryName,
            block: dto.block,
            row: dto.row,
            plot: dto.plot,
            status: 'LIVRE',
            ownerName: dto.ownerName,
            occupantName: dto.occupantName,
            locationCode: dto.locationCode,
            documentKeys: dto.documentKeys ?? [],
            history: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    status: 'LIVRE',
                    message: 'Jazigo cadastrado',
                    createdAt: new Date().toISOString(),
                    actorId,
                },
            ],
        });
        await this.cacheService.invalidateByPrefix(`cemetery:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Jazigo nao encontrado');
        if (dto.ownerName !== undefined)
            current.ownerName = dto.ownerName;
        if (dto.occupantName !== undefined)
            current.occupantName = dto.occupantName;
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
    async addDocumentKeys(tenantId, id, keys, actorId) {
        const current = await this.repository.findById(tenantId, id);
        if (!current)
            throw new common_1.NotFoundException('Jazigo nao encontrado');
        current.documentKeys = Array.from(new Set([...(current.documentKeys ?? []), ...keys]));
        current.history.unshift({
            id: (0, crypto_1.randomUUID)(),
            status: current.status,
            message: `Documentos vinculados (${keys.length})`,
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
            livres: items.filter((item) => item.status === 'LIVRE').length,
            reservados: items.filter((item) => item.status === 'RESERVADO').length,
            ocupados: items.filter((item) => item.status === 'OCUPADO').length,
            manutencao: items.filter((item) => item.status === 'EM_MANUTENCAO').length,
            documentos: items.reduce((acc, item) => acc + (item.documentKeys?.length ?? 0), 0),
        };
    }
};
exports.CemeteryService = CemeteryService;
exports.CemeteryService = CemeteryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cemetery_repository_1.CemeteryRepository,
        cache_service_1.CacheService])
], CemeteryService);
//# sourceMappingURL=cemetery.service.js.map