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
exports.FactorsService = void 0;
const common_1 = require("@nestjs/common");
const factors_repository_1 = require("./factors.repository");
const projects_service_1 = require("../../projects/projects.service");
const object_id_1 = require("../../../common/utils/object-id");
let FactorsService = class FactorsService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async list(tenantId, projectId, category) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProjectId), category);
    }
    async findById(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findById(tenantId, String(resolvedProjectId), id);
    }
    async create(tenantId, dto, userId) {
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const existingDefault = await this.repository.findDefault(tenantId, String(projectId), dto.category);
        const shouldBeDefault = dto.isDefault ?? !existingDefault;
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            category: dto.category,
            key: dto.key,
            label: dto.label,
            value: dto.value,
            description: dto.description,
            isDefault: shouldBeDefault,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.update(tenantId, String(resolvedProjectId), id, dto);
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        await this.repository.delete(tenantId, String(resolvedProjectId), id);
        return { success: true };
    }
};
exports.FactorsService = FactorsService;
exports.FactorsService = FactorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [factors_repository_1.FactorsRepository,
        projects_service_1.ProjectsService])
], FactorsService);
//# sourceMappingURL=factors.service.js.map