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
exports.ParcelBuildingsService = void 0;
const common_1 = require("@nestjs/common");
const parcel_buildings_repository_1 = require("./parcel-buildings.repository");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
let ParcelBuildingsService = class ParcelBuildingsService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async findByParcel(tenantId, projectId, parcelId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findByParcel(tenantId, String(resolvedProjectId), parcelId);
    }
    async upsert(tenantId, projectId, parcelId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const useType = dto.useType ?? dto.uso;
        const constructionStandard = dto.constructionStandard ?? dto.padraoConstrutivo;
        const builtArea = dto.builtArea ?? dto.areaConstruida;
        const floors = dto.floors ?? dto.pavimentos;
        const constructionYear = dto.constructionYear ?? dto.anoConstrucao;
        const occupancyType = dto.occupancyType ?? dto.tipoOcupacao;
        return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
            useType,
            constructionStandard,
            builtArea,
            floors,
            constructionYear,
            occupancyType,
            uso: dto.uso ?? useType,
            padraoConstrutivo: dto.padraoConstrutivo ?? constructionStandard,
            areaConstruida: dto.areaConstruida ?? builtArea,
            pavimentos: dto.pavimentos ?? floors,
            anoConstrucao: dto.anoConstrucao ?? constructionYear,
            tipoOcupacao: dto.tipoOcupacao ?? occupancyType,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
};
exports.ParcelBuildingsService = ParcelBuildingsService;
exports.ParcelBuildingsService = ParcelBuildingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcel_buildings_repository_1.ParcelBuildingsRepository,
        projects_service_1.ProjectsService])
], ParcelBuildingsService);
//# sourceMappingURL=parcel-buildings.service.js.map