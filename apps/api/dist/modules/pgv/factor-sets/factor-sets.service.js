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
exports.FactorSetsService = void 0;
const common_1 = require("@nestjs/common");
const factor_sets_repository_1 = require("./factor-sets.repository");
const projects_service_1 = require("../../projects/projects.service");
const object_id_1 = require("../../../common/utils/object-id");
let FactorSetsService = class FactorSetsService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async get(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const existing = await this.repository.findByProject(tenantId, String(resolvedProjectId));
        if (existing)
            return existing;
        return this.repository.upsert(tenantId, String(resolvedProjectId), {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProjectId,
            fatoresTerreno: [],
            fatoresConstrucao: [],
            valoresConstrucaoM2: [],
        });
    }
    async update(tenantId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        return this.repository.upsert(tenantId, String(resolvedProjectId), {
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProjectId,
            fatoresTerreno: dto.fatoresTerreno ?? [],
            fatoresConstrucao: dto.fatoresConstrucao ?? [],
            valoresConstrucaoM2: dto.valoresConstrucaoM2 ?? [],
            updatedBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
};
exports.FactorSetsService = FactorSetsService;
exports.FactorSetsService = FactorSetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [factor_sets_repository_1.FactorSetsRepository,
        projects_service_1.ProjectsService])
], FactorSetsService);
//# sourceMappingURL=factor-sets.service.js.map