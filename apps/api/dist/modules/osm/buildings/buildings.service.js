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
exports.BuildingsService = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("../../projects/projects.service");
const buildings_repository_1 = require("./buildings.repository");
let BuildingsService = class BuildingsService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async list(tenantId, projectId, bbox) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProjectId), bbox);
    }
    async geojson(tenantId, projectId, bbox) {
        const buildings = await this.list(tenantId, projectId, bbox);
        return {
            type: 'FeatureCollection',
            features: buildings.map((building) => ({
                type: 'Feature',
                id: building.id,
                geometry: building.geometry,
                properties: {
                    featureType: 'building',
                    buildingId: building.id,
                    name: building.name,
                    nome: building.nome ?? building.name,
                    building: building.building,
                    tipo: building.tipo ?? building.building,
                },
            })),
        };
    }
};
exports.BuildingsService = BuildingsService;
exports.BuildingsService = BuildingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [buildings_repository_1.BuildingsRepository,
        projects_service_1.ProjectsService])
], BuildingsService);
//# sourceMappingURL=buildings.service.js.map