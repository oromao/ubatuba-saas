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
exports.FacesService = void 0;
const common_1 = require("@nestjs/common");
const faces_repository_1 = require("./faces.repository");
const geo_1 = require("../../../common/utils/geo");
const projects_service_1 = require("../../projects/projects.service");
const object_id_1 = require("../../../common/utils/object-id");
let FacesService = class FacesService {
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
    async create(tenantId, dto, userId) {
        if (!(0, geo_1.isLineGeometry)(dto.geometry)) {
            throw new common_1.BadRequestException('Geometria invalida para face de quadra');
        }
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const code = dto.code;
        const zoneId = dto.zoneId ?? dto.zonaValorId;
        const landValuePerSqm = dto.landValuePerSqm ?? dto.valorTerrenoM2;
        if (!code) {
            throw new common_1.BadRequestException('Codigo da face e obrigatorio');
        }
        if (landValuePerSqm === undefined) {
            throw new common_1.BadRequestException('Valor do terreno por m2 e obrigatorio');
        }
        const metadados = dto.metadados ?? {
            lado: dto.lado,
            trecho: dto.trecho,
            observacoes: dto.observacoes,
        };
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            code,
            logradouroId: dto.logradouroId ? (0, object_id_1.asObjectId)(dto.logradouroId) : undefined,
            zoneId: zoneId ? (0, object_id_1.asObjectId)(zoneId) : undefined,
            zonaValorId: zoneId ? (0, object_id_1.asObjectId)(zoneId) : undefined,
            landValuePerSqm,
            valorTerrenoM2: dto.valorTerrenoM2 ?? landValuePerSqm,
            metadados,
            geometry: dto.geometry,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const zoneId = dto.zoneId ?? dto.zonaValorId;
        const landValuePerSqm = dto.landValuePerSqm ?? dto.valorTerrenoM2;
        const metadados = dto.metadados ?? {
            lado: dto.lado,
            trecho: dto.trecho,
            observacoes: dto.observacoes,
        };
        const update = {};
        if (dto.code)
            update.code = dto.code;
        if (dto.logradouroId)
            update.logradouroId = (0, object_id_1.asObjectId)(dto.logradouroId);
        if (zoneId) {
            update.zoneId = (0, object_id_1.asObjectId)(zoneId);
            update.zonaValorId = (0, object_id_1.asObjectId)(zoneId);
        }
        if (landValuePerSqm !== undefined) {
            update.landValuePerSqm = landValuePerSqm;
            update.valorTerrenoM2 = dto.valorTerrenoM2 ?? landValuePerSqm;
        }
        if (metadados) {
            update.metadados = metadados;
        }
        if (dto.geometry) {
            if (!(0, geo_1.isLineGeometry)(dto.geometry)) {
                throw new common_1.BadRequestException('Geometria invalida para face de quadra');
            }
            update.geometry = dto.geometry;
        }
        return this.repository.update(tenantId, String(resolvedProjectId), id, update);
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        await this.repository.delete(tenantId, String(resolvedProjectId), id);
        return { success: true };
    }
    async geojson(tenantId, projectId, bbox) {
        const faces = await this.list(tenantId, projectId, bbox);
        return {
            type: 'FeatureCollection',
            features: faces.map((face) => ({
                type: 'Feature',
                id: face.id,
                geometry: face.geometry,
                properties: {
                    featureType: 'face',
                    faceId: face.id,
                    code: face.code,
                    landValuePerSqm: face.landValuePerSqm,
                    valorTerrenoM2: face.valorTerrenoM2 ?? face.landValuePerSqm,
                },
            })),
        };
    }
    async importGeojson(tenantId, projectId, featureCollection, userId) {
        if (!featureCollection?.features?.length) {
            return { inserted: 0, errors: 0 };
        }
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        let inserted = 0;
        let errors = 0;
        for (const feature of featureCollection.features) {
            const geometry = feature.geometry;
            if (!(0, geo_1.isLineGeometry)(geometry)) {
                errors += 1;
                continue;
            }
            const props = feature.properties ?? {};
            const code = String(props.code ?? props.COD ?? '').trim();
            const landValuePerSqm = Number(props.landValuePerSqm ?? props.valorTerrenoM2 ?? props.valor_m2 ?? 0);
            if (!code) {
                errors += 1;
                continue;
            }
            try {
                await this.repository.create({
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
                    projectId: resolvedProjectId,
                    code,
                    landValuePerSqm,
                    valorTerrenoM2: landValuePerSqm,
                    geometry,
                    createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
                });
                inserted += 1;
            }
            catch {
                errors += 1;
            }
        }
        return { inserted, errors };
    }
};
exports.FacesService = FacesService;
exports.FacesService = FacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [faces_repository_1.FacesRepository,
        projects_service_1.ProjectsService])
], FacesService);
//# sourceMappingURL=faces.service.js.map