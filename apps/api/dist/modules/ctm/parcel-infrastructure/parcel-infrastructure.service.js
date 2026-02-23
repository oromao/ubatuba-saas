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
exports.ParcelInfrastructureService = void 0;
const common_1 = require("@nestjs/common");
const parcel_infrastructure_repository_1 = require("./parcel-infrastructure.repository");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
let ParcelInfrastructureService = class ParcelInfrastructureService {
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
        const water = dto.water ?? dto.agua;
        const sewage = dto.sewage ?? dto.esgoto;
        const electricity = dto.electricity ?? dto.energia;
        const pavingType = dto.pavingType ?? dto.pavimentacao;
        const publicLighting = dto.publicLighting ?? dto.iluminacao;
        const garbageCollection = dto.garbageCollection ?? dto.coleta;
        return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
            water,
            sewage,
            electricity,
            pavingType,
            publicLighting,
            garbageCollection,
            agua: dto.agua ?? water,
            esgoto: dto.esgoto ?? sewage,
            energia: dto.energia ?? electricity,
            pavimentacao: dto.pavimentacao ?? pavingType,
            iluminacao: dto.iluminacao ?? publicLighting,
            coleta: dto.coleta ?? garbageCollection,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
};
exports.ParcelInfrastructureService = ParcelInfrastructureService;
exports.ParcelInfrastructureService = ParcelInfrastructureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcel_infrastructure_repository_1.ParcelInfrastructureRepository,
        projects_service_1.ProjectsService])
], ParcelInfrastructureService);
//# sourceMappingURL=parcel-infrastructure.service.js.map