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
exports.ZonesService = void 0;
const common_1 = require("@nestjs/common");
const zones_repository_1 = require("./zones.repository");
const projects_service_1 = require("../../projects/projects.service");
const geo_1 = require("../../../common/utils/geo");
const object_id_1 = require("../../../common/utils/object-id");
let ZonesService = class ZonesService {
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
        if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
            throw new common_1.BadRequestException('Geometria invalida para zona');
        }
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const code = dto.code ?? dto.codigo;
        const name = dto.name ?? dto.nome;
        const description = dto.description ?? dto.descricao;
        const baseLandValue = dto.baseLandValue ?? dto.valorBaseTerrenoM2;
        const baseConstructionValue = dto.baseConstructionValue ?? dto.valorBaseConstrucaoM2;
        if (!code || !name) {
            throw new common_1.BadRequestException('Codigo e nome sao obrigatorios');
        }
        if (baseLandValue === undefined || baseConstructionValue === undefined) {
            throw new common_1.BadRequestException('Valores base sao obrigatorios');
        }
        return this.repository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId,
            code,
            name,
            description,
            nome: dto.nome ?? name,
            descricao: dto.descricao ?? description,
            baseLandValue,
            baseConstructionValue,
            valorBaseTerrenoM2: dto.valorBaseTerrenoM2 ?? baseLandValue,
            valorBaseConstrucaoM2: dto.valorBaseConstrucaoM2 ?? baseConstructionValue,
            geometry: dto.geometry,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async update(tenantId, projectId, id, dto) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const code = dto.code ?? dto.codigo;
        const name = dto.name ?? dto.nome;
        const description = dto.description ?? dto.descricao;
        const baseLandValue = dto.baseLandValue ?? dto.valorBaseTerrenoM2;
        const baseConstructionValue = dto.baseConstructionValue ?? dto.valorBaseConstrucaoM2;
        const update = {};
        if (code) {
            update.code = code;
            update.codigo = dto.codigo ?? code;
        }
        if (name) {
            update.name = name;
            update.nome = dto.nome ?? name;
        }
        if (description !== undefined) {
            update.description = description;
            update.descricao = dto.descricao ?? description;
        }
        if (baseLandValue !== undefined) {
            update.baseLandValue = baseLandValue;
            update.valorBaseTerrenoM2 = dto.valorBaseTerrenoM2 ?? baseLandValue;
        }
        if (baseConstructionValue !== undefined) {
            update.baseConstructionValue = baseConstructionValue;
            update.valorBaseConstrucaoM2 = dto.valorBaseConstrucaoM2 ?? baseConstructionValue;
        }
        if (dto.geometry) {
            if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
                throw new common_1.BadRequestException('Geometria invalida para zona');
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
        const zones = await this.list(tenantId, projectId, bbox);
        return {
            type: 'FeatureCollection',
            features: zones.map((zone) => ({
                type: 'Feature',
                id: zone.id,
                geometry: zone.geometry,
                properties: {
                    featureType: 'zone',
                    zoneId: zone.id,
                    code: zone.code,
                    name: zone.name,
                    nome: zone.nome ?? zone.name,
                    baseLandValue: zone.baseLandValue,
                    baseConstructionValue: zone.baseConstructionValue,
                    valorBaseTerrenoM2: zone.valorBaseTerrenoM2 ?? zone.baseLandValue,
                    valorBaseConstrucaoM2: zone.valorBaseConstrucaoM2 ?? zone.baseConstructionValue,
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
            if (!(0, geo_1.isPolygonGeometry)(geometry)) {
                errors += 1;
                continue;
            }
            const props = feature.properties ?? {};
            const code = String(props.code ?? props.codigo ?? props.COD ?? '').trim();
            const name = String(props.name ?? props.nome ?? props.NOME ?? '').trim();
            const baseLandValue = Number(props.baseLandValue ?? props.valorBaseTerrenoM2 ?? props.valor_terreno ?? 0);
            const baseConstructionValue = Number(props.baseConstructionValue ??
                props.valorBaseConstrucaoM2 ??
                props.valor_construcao ??
                0);
            if (!code || !name) {
                errors += 1;
                continue;
            }
            try {
                await this.repository.create({
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
                    projectId: resolvedProjectId,
                    code,
                    name,
                    description: String(props.description ?? props.descricao ?? ''),
                    nome: String(props.nome ?? name),
                    descricao: String(props.descricao ?? props.description ?? ''),
                    baseLandValue,
                    baseConstructionValue,
                    valorBaseTerrenoM2: baseLandValue,
                    valorBaseConstrucaoM2: baseConstructionValue,
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
exports.ZonesService = ZonesService;
exports.ZonesService = ZonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zones_repository_1.ZonesRepository,
        projects_service_1.ProjectsService])
], ZonesService);
//# sourceMappingURL=zones.service.js.map