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
exports.MapFeaturesService = void 0;
const common_1 = require("@nestjs/common");
const map_features_repository_1 = require("./map-features.repository");
const geo_1 = require("../../common/utils/geo");
const object_id_1 = require("../../common/utils/object-id");
const projects_service_1 = require("../projects/projects.service");
const tenants_service_1 = require("../tenants/tenants.service");
const FEATURE_TYPES = new Set(['parcel', 'building']);
const normalizeFeatureType = (value) => {
    if (!value || !FEATURE_TYPES.has(value)) {
        throw new common_1.BadRequestException('Tipo de feature invalido');
    }
    return value;
};
const parseBbox = (bbox) => {
    if (!bbox)
        return undefined;
    const parts = bbox.split(',').map((item) => Number(item.trim()));
    if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
        throw new common_1.BadRequestException('BBOX invalido');
    }
    return bbox;
};
const normalizeProperties = (value) => {
    if (!value || typeof value !== 'object')
        return {};
    return { ...value };
};
const ensureStatus = (properties) => {
    const status = properties.status;
    if (typeof status === 'string' && status.trim().length > 0) {
        return properties;
    }
    return { ...properties, status: 'ATIVO' };
};
let MapFeaturesService = class MapFeaturesService {
    constructor(repository, projectsService, tenantsService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.tenantsService = tenantsService;
    }
    toResponse(doc) {
        const plain = doc.toObject();
        return {
            ...plain,
            id: String(plain._id),
        };
    }
    async create(tenantId, dto, userId) {
        if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
            throw new common_1.BadRequestException('Geometria invalida');
        }
        const featureType = normalizeFeatureType(dto.featureType);
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const [tenant, project] = await Promise.all([
            this.tenantsService.findById(tenantId),
            this.projectsService.findById(tenantId, String(projectId)),
        ]);
        const properties = ensureStatus(normalizeProperties(dto.properties));
        const created = await this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            tenantSlug: tenant?.slug,
            projectSlug: project?.slug,
            featureType,
            properties,
            geometry: dto.geometry,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
        return this.toResponse(created);
    }
    async update(tenantId, projectId, id, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const update = {
            updatedBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        };
        if (dto.geometry) {
            if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
                throw new common_1.BadRequestException('Geometria invalida');
            }
            update.geometry = dto.geometry;
        }
        if (dto.properties) {
            update.properties = ensureStatus(normalizeProperties(dto.properties));
        }
        const updated = await this.repository.update(tenantId, String(resolvedProjectId), id, update);
        if (!updated) {
            throw new common_1.BadRequestException('Feature nao encontrada');
        }
        return this.toResponse(updated);
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        await this.repository.delete(tenantId, String(resolvedProjectId), id);
        return { success: true };
    }
    async geojson(tenantId, projectId, featureType, bbox) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const parsedBbox = parseBbox(bbox);
        const parsedType = featureType ? normalizeFeatureType(featureType) : undefined;
        const features = await this.repository.list(tenantId, String(resolvedProjectId), parsedType, parsedBbox);
        return {
            type: 'FeatureCollection',
            features: features.map((feature) => ({
                type: 'Feature',
                id: feature.id,
                geometry: feature.geometry,
                properties: {
                    ...(feature.properties ?? {}),
                    mapFeatureId: feature.id,
                    featureType: feature.featureType,
                },
            })),
        };
    }
};
exports.MapFeaturesService = MapFeaturesService;
exports.MapFeaturesService = MapFeaturesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [map_features_repository_1.MapFeaturesRepository,
        projects_service_1.ProjectsService,
        tenants_service_1.TenantsService])
], MapFeaturesService);
//# sourceMappingURL=map-features.service.js.map