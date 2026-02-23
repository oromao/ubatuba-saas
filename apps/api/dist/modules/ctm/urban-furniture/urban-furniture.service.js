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
exports.UrbanFurnitureService = void 0;
const common_1 = require("@nestjs/common");
const urban_furniture_repository_1 = require("./urban-furniture.repository");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
let UrbanFurnitureService = class UrbanFurnitureService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async list(tenantId, projectId, bbox) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProjectId), bbox);
    }
    async findById(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findById(tenantId, String(resolvedProjectId), id);
    }
    async create(tenantId, projectId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const type = dto.type ?? dto.tipo;
        if (!type) {
            throw new common_1.BadRequestException('Tipo de mobiliario obrigatorio');
        }
        const condition = dto.condition ?? dto.estadoConservacao;
        const notes = dto.notes ?? dto.observacao;
        const photoUrl = dto.photoUrl ?? dto.fotoUrl;
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProjectId,
            type,
            tipo: dto.tipo ?? type,
            location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
            geometry: { type: 'Point', coordinates: [dto.lng, dto.lat] },
            condition,
            estadoConservacao: dto.estadoConservacao ?? condition,
            notes,
            observacao: dto.observacao ?? notes,
            photoUrl,
            fotoUrl: dto.fotoUrl ?? photoUrl,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const type = dto.type ?? dto.tipo;
        const condition = dto.condition ?? dto.estadoConservacao;
        const notes = dto.notes ?? dto.observacao;
        const photoUrl = dto.photoUrl ?? dto.fotoUrl;
        const update = {};
        if (type !== undefined) {
            update.type = type;
            update.tipo = dto.tipo ?? type;
        }
        if (condition !== undefined) {
            update.condition = condition;
            update.estadoConservacao = dto.estadoConservacao ?? condition;
        }
        if (notes !== undefined) {
            update.notes = notes;
            update.observacao = dto.observacao ?? notes;
        }
        if (photoUrl !== undefined) {
            update.photoUrl = photoUrl;
            update.fotoUrl = dto.fotoUrl ?? photoUrl;
        }
        if (dto.lat !== undefined && dto.lng !== undefined) {
            update.location = { type: 'Point', coordinates: [dto.lng, dto.lat] };
            update.geometry = { type: 'Point', coordinates: [dto.lng, dto.lat] };
        }
        return this.repository.update(tenantId, String(resolvedProjectId), id, update);
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.delete(tenantId, String(resolvedProjectId), id);
    }
};
exports.UrbanFurnitureService = UrbanFurnitureService;
exports.UrbanFurnitureService = UrbanFurnitureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [urban_furniture_repository_1.UrbanFurnitureRepository,
        projects_service_1.ProjectsService])
], UrbanFurnitureService);
//# sourceMappingURL=urban-furniture.service.js.map