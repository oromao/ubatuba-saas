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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../shared/cache.service");
const assets_repository_1 = require("./assets.repository");
const object_id_1 = require("../../common/utils/object-id");
let AssetsService = class AssetsService {
    constructor(assetsRepository, cacheService) {
        this.assetsRepository = assetsRepository;
        this.cacheService = cacheService;
    }
    list(tenantId, bbox) {
        return this.assetsRepository.list(tenantId, bbox);
    }
    findById(tenantId, id) {
        return this.assetsRepository.findById(tenantId, id);
    }
    async create(tenantId, dto) {
        const created = await this.assetsRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            name: dto.name,
            category: dto.category,
            status: 'ATIVO',
            location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
        });
        await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
        return created;
    }
    async update(tenantId, id, dto) {
        const updated = await this.assetsRepository.update(tenantId, id, dto);
        await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
        return updated;
    }
    async remove(tenantId, id) {
        await this.assetsRepository.delete(tenantId, id);
        await this.cacheService.invalidateByPrefix(`assets:${tenantId}`);
        return { success: true };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [assets_repository_1.AssetsRepository,
        cache_service_1.CacheService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map