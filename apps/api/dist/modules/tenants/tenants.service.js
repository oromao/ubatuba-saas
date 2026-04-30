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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const tenants_repository_1 = require("./tenants.repository");
let TenantsService = class TenantsService {
    constructor(tenantsRepository) {
        this.tenantsRepository = tenantsRepository;
    }
    create(dto) {
        return this.tenantsRepository.create(dto);
    }
    findById(id) {
        return this.tenantsRepository.findById(id);
    }
    findBySlug(slug) {
        return this.tenantsRepository.findBySlug(slug);
    }
    async getMunicipalConfig(tenantId) {
        const tenant = await this.tenantsRepository.findById(tenantId);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant nao encontrado');
        return tenant.municipalConfig || {};
    }
    async updateMunicipalConfig(tenantId, dto) {
        const tenant = await this.tenantsRepository.findById(tenantId);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant nao encontrado');
        const config = tenant.municipalConfig || {};
        const merged = { ...config, ...dto };
        tenant.municipalConfig = merged;
        await this.tenantsRepository.save(tenant);
        return tenant.municipalConfig || {};
    }
    async getAliquotasPadrao(tenantId) {
        const tenant = await this.tenantsRepository.findById(tenantId);
        if (!tenant)
            return {};
        return tenant.municipalConfig?.aliquotasPadrao || {};
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_repository_1.TenantsRepository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map