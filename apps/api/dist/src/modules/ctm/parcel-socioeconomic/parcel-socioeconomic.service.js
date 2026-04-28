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
exports.ParcelSocioeconomicService = void 0;
const common_1 = require("@nestjs/common");
const parcel_socioeconomic_repository_1 = require("./parcel-socioeconomic.repository");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
let ParcelSocioeconomicService = class ParcelSocioeconomicService {
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
        const incomeBracket = dto.incomeBracket ?? dto.faixaRenda;
        const residents = dto.residents ?? dto.moradores;
        const vulnerabilityIndicator = dto.vulnerabilityIndicator ?? dto.vulnerabilidade;
        return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
            incomeBracket,
            residents,
            vulnerabilityIndicator,
            faixaRenda: dto.faixaRenda ?? incomeBracket,
            moradores: dto.moradores ?? residents,
            vulnerabilidade: dto.vulnerabilidade ?? vulnerabilityIndicator,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
};
exports.ParcelSocioeconomicService = ParcelSocioeconomicService;
exports.ParcelSocioeconomicService = ParcelSocioeconomicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcel_socioeconomic_repository_1.ParcelSocioeconomicRepository,
        projects_service_1.ProjectsService])
], ParcelSocioeconomicService);
//# sourceMappingURL=parcel-socioeconomic.service.js.map