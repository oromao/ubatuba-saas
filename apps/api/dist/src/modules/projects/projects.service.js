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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const projects_repository_1 = require("./projects.repository");
const object_id_1 = require("../../common/utils/object-id");
let ProjectsService = class ProjectsService {
    constructor(projectsRepository) {
        this.projectsRepository = projectsRepository;
    }
    list(tenantId) {
        return this.projectsRepository.list(tenantId);
    }
    findById(tenantId, id) {
        return this.projectsRepository.findById(tenantId, id);
    }
    async resolveProjectId(tenantId, projectId) {
        if (projectId) {
            return (0, object_id_1.asObjectId)(projectId);
        }
        const existing = await this.projectsRepository.findDefault(tenantId);
        if (existing) {
            return (0, object_id_1.asObjectId)(existing.id);
        }
        const created = await this.projectsRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            name: 'Projeto Demo',
            slug: 'demo',
            isDefault: true,
        });
        return (0, object_id_1.asObjectId)(created.id);
    }
    async create(tenantId, dto, userId) {
        return this.projectsRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            defaultCenter: dto.defaultCenter,
            defaultBbox: dto.defaultBbox,
            defaultZoom: dto.defaultZoom,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    update(tenantId, id, dto) {
        return this.projectsRepository.update(tenantId, id, {
            name: dto.name,
            description: dto.description,
            defaultCenter: dto.defaultCenter,
            defaultBbox: dto.defaultBbox,
            defaultZoom: dto.defaultZoom,
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map