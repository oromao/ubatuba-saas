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
exports.ProcessesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const cache_service_1 = require("../shared/cache.service");
const processes_repository_1 = require("./processes.repository");
const object_id_1 = require("../../common/utils/object-id");
let ProcessesService = class ProcessesService {
    constructor(processesRepository, cacheService) {
        this.processesRepository = processesRepository;
        this.cacheService = cacheService;
    }
    list(tenantId) {
        return this.processesRepository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.processesRepository.findById(tenantId, id);
    }
    async create(tenantId, dto) {
        const protocolNumber = `PR-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
        const created = await this.processesRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            protocolNumber,
            title: dto.title,
            owner: dto.owner,
            status: 'EM_ANALISE',
        });
        await this.processesRepository.addEvent({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            processId: created.id,
            type: 'CREATED',
            message: 'Processo criado',
        });
        await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto) {
        const updated = await this.processesRepository.update(tenantId, id, dto);
        await this.cacheService.invalidateByPrefix(`processes:${tenantId}`);
        return updated;
    }
    async transition(tenantId, id, dto) {
        const updated = await this.processesRepository.update(tenantId, id, {
            status: dto.status,
        });
        await this.processesRepository.addEvent({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            processId: id,
            type: 'STATUS_CHANGED',
            message: dto.message,
        });
        await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
        return updated;
    }
    async remove(tenantId, id) {
        await this.processesRepository.delete(tenantId, id);
        await this.cacheService.invalidateByPrefix(`processes:${tenantId}`);
        return { success: true };
    }
    events(tenantId, id) {
        return this.processesRepository.listEvents(tenantId, id);
    }
};
exports.ProcessesService = ProcessesService;
exports.ProcessesService = ProcessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [processes_repository_1.ProcessesRepository,
        cache_service_1.CacheService])
], ProcessesService);
//# sourceMappingURL=processes.service.js.map