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
exports.VersionsService = void 0;
const common_1 = require("@nestjs/common");
const versions_repository_1 = require("./versions.repository");
const projects_service_1 = require("../../projects/projects.service");
const object_id_1 = require("../../../common/utils/object-id");
let VersionsService = class VersionsService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async list(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProjectId));
    }
    async findById(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findById(tenantId, String(resolvedProjectId), id);
    }
    async getActiveOrDefault(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const active = await this.repository.findActive(tenantId, String(resolvedProjectId));
        if (active)
            return active;
        const created = await this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProjectId,
            name: 'PGV 2026',
            year: 2026,
            isActive: true,
        });
        return created;
    }
    async findByNameOrYear(tenantId, projectId, value) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findByNameOrYear(tenantId, String(resolvedProjectId), value);
    }
    async create(tenantId, dto, userId) {
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            name: dto.name,
            year: dto.year,
            isActive: false,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        if (dto.isActive) {
            return this.repository.setActive(tenantId, String(resolvedProjectId), id);
        }
        return this.repository.update(tenantId, String(resolvedProjectId), id, dto);
    }
};
exports.VersionsService = VersionsService;
exports.VersionsService = VersionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [versions_repository_1.VersionsRepository,
        projects_service_1.ProjectsService])
], VersionsService);
//# sourceMappingURL=versions.service.js.map