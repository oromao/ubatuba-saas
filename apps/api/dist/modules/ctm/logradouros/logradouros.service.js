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
exports.LogradourosService = void 0;
const common_1 = require("@nestjs/common");
const logradouros_repository_1 = require("./logradouros.repository");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
let LogradourosService = class LogradourosService {
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
    async create(tenantId, projectId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const name = dto.name ?? dto.nome;
        const type = dto.type ?? dto.tipo;
        const code = dto.code ?? dto.codigo;
        if (!name || !type || !code) {
            throw new common_1.BadRequestException('Nome, tipo e codigo sao obrigatorios');
        }
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProjectId,
            name,
            nome: dto.nome ?? name,
            type,
            tipo: dto.tipo ?? type,
            code,
            codigo: dto.codigo ?? code,
            geometry: dto.geometry,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const name = dto.name ?? dto.nome;
        const type = dto.type ?? dto.tipo;
        const code = dto.code ?? dto.codigo;
        return this.repository.update(tenantId, String(resolvedProjectId), id, {
            name,
            nome: dto.nome ?? name,
            type,
            tipo: dto.tipo ?? type,
            code,
            codigo: dto.codigo ?? code,
            geometry: dto.geometry,
        });
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.delete(tenantId, String(resolvedProjectId), id);
    }
};
exports.LogradourosService = LogradourosService;
exports.LogradourosService = LogradourosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logradouros_repository_1.LogradourosRepository,
        projects_service_1.ProjectsService])
], LogradourosService);
//# sourceMappingURL=logradouros.service.js.map