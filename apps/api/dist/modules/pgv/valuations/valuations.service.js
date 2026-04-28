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
exports.ValuationsService = void 0;
const common_1 = require("@nestjs/common");
const valuations_repository_1 = require("./valuations.repository");
const projects_service_1 = require("../../projects/projects.service");
const object_id_1 = require("../../../common/utils/object-id");
const calc_1 = require("../utils/calc");
const parcels_repository_1 = require("../../ctm/parcels/parcels.repository");
const parcel_buildings_repository_1 = require("../../ctm/parcel-buildings/parcel-buildings.repository");
const zones_repository_1 = require("../zones/zones.repository");
const faces_repository_1 = require("../faces/faces.repository");
const factors_repository_1 = require("../factors/factors.repository");
const factor_sets_repository_1 = require("../factor-sets/factor-sets.repository");
const versions_service_1 = require("../versions/versions.service");
const assessments_repository_1 = require("../assessments/assessments.repository");
let ValuationsService = class ValuationsService {
    constructor(repository, projectsService, parcelsRepository, parcelBuildingsRepository, zonesRepository, facesRepository, factorsRepository, factorSetsRepository, versionsService, assessmentsRepository) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.parcelsRepository = parcelsRepository;
        this.parcelBuildingsRepository = parcelBuildingsRepository;
        this.zonesRepository = zonesRepository;
        this.facesRepository = facesRepository;
        this.factorsRepository = factorsRepository;
        this.factorSetsRepository = factorSetsRepository;
        this.versionsService = versionsService;
        this.assessmentsRepository = assessmentsRepository;
    }
    async list(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProjectId));
    }
    async byParcel(tenantId, projectId, parcelId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findByParcel(tenantId, String(resolvedProjectId), parcelId);
    }
    async calculate(tenantId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const projectId = String(resolvedProjectId);
        const parcel = await this.parcelsRepository.findById(tenantId, projectId, dto.parcelId);
        if (!parcel) {
            throw new common_1.BadRequestException('Parcela nao encontrada');
        }
        const building = await this.parcelBuildingsRepository.findByParcel(tenantId, projectId, parcel.id);
        const zone = dto.zoneId
            ? await this.zonesRepository.findById(tenantId, projectId, dto.zoneId)
            : parcel.zoneId
                ? await this.zonesRepository.findById(tenantId, projectId, String(parcel.zoneId))
                : await this.zonesRepository.findByGeometry(tenantId, projectId, parcel.geometry);
        const face = dto.faceId
            ? await this.facesRepository.findById(tenantId, projectId, dto.faceId)
            : parcel.faceId
                ? await this.facesRepository.findById(tenantId, projectId, String(parcel.faceId))
                : await this.facesRepository.findByGeometry(tenantId, projectId, parcel.geometry);
        const landValuePerSqm = face?.landValuePerSqm ??
            face?.valorTerrenoM2 ??
            zone?.baseLandValue ??
            zone?.valorBaseTerrenoM2 ??
            0;
        const constructionValuePerSqm = zone?.baseConstructionValue ?? zone?.valorBaseConstrucaoM2 ?? 0;
        const landFactorDoc = dto.landFactorId
            ? await this.factorsRepository.findById(tenantId, projectId, dto.landFactorId)
            : await this.factorsRepository.findDefault(tenantId, projectId, 'LAND');
        const constructionFactorDoc = dto.constructionFactorId
            ? await this.factorsRepository.findById(tenantId, projectId, dto.constructionFactorId)
            : await this.factorsRepository.findDefault(tenantId, projectId, 'CONSTRUCTION');
        const factorSet = await this.factorSetsRepository.findByProject(tenantId, projectId);
        const landFactorSetValue = factorSet?.fatoresTerreno?.reduce((acc, factor) => acc * (factor.valorMultiplicador ?? 1), 1) ?? 1;
        const constructionFactorSetValue = factorSet?.fatoresConstrucao?.reduce((acc, factor) => acc * (factor.valorMultiplicador ?? 1), 1) ?? 1;
        const landFactorBase = landFactorDoc?.value ?? 1;
        const constructionFactorBase = constructionFactorDoc?.value ?? 1;
        const landFactor = landFactorBase * landFactorSetValue;
        const constructionFactor = constructionFactorBase * constructionFactorSetValue;
        const buildingUso = building?.uso ?? building?.useType;
        const buildingPadrao = building?.padraoConstrutivo ?? building?.constructionStandard;
        const constructionValueFromSet = factorSet?.valoresConstrucaoM2?.find((item) => (!buildingUso || item.uso === buildingUso) &&
            (!buildingPadrao || item.padraoConstrutivo === buildingPadrao));
        const result = (0, calc_1.calculateVenalValue)({
            landArea: parcel.areaTerreno ?? parcel.area ?? 0,
            builtArea: building?.builtArea ?? building?.areaConstruida ?? 0,
            landValuePerSqm,
            landFactor,
            constructionValuePerSqm: constructionValueFromSet?.valorM2 ?? constructionValuePerSqm,
            constructionFactor,
        });
        const version = dto.versionId
            ? await this.versionsService.findById(tenantId, projectId, dto.versionId)
            : dto.versao
                ? await this.versionsService.findByNameOrYear(tenantId, projectId, dto.versao)
                : await this.versionsService.getActiveOrDefault(tenantId, projectId);
        if (!version) {
            throw new common_1.BadRequestException('Versao PGV nao encontrada');
        }
        const appliedConstructionValuePerSqm = constructionValueFromSet?.valorM2 ?? constructionValuePerSqm;
        const breakdown = {
            zoneId: zone?.id ?? null,
            faceId: face?.id ?? null,
            landFactorId: landFactorDoc?.id ?? null,
            constructionFactorId: constructionFactorDoc?.id ?? null,
            landValuePerSqm,
            constructionValuePerSqm: appliedConstructionValuePerSqm,
            parcelArea: parcel.areaTerreno ?? parcel.area ?? 0,
            builtArea: building?.builtArea ?? building?.areaConstruida ?? 0,
            factorSetId: factorSet?._id ?? null,
            fatoresTerreno: factorSet?.fatoresTerreno ?? [],
            fatoresConstrucao: factorSet?.fatoresConstrucao ?? [],
            valoresConstrucaoM2: factorSet?.valoresConstrucaoM2 ?? [],
            landFactorBase,
            constructionFactorBase,
        };
        if (dto.persist) {
            const versionName = version.name ?? String(version.year);
            await this.repository.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: resolvedProjectId,
                parcelId: (0, object_id_1.asObjectId)(parcel.id),
                versionId: (0, object_id_1.asObjectId)(version.id),
                landValuePerSqm,
                landFactor,
                constructionValuePerSqm: appliedConstructionValuePerSqm,
                constructionFactor,
                landValue: result.landValue,
                constructionValue: result.constructionValue,
                totalValue: result.totalValue,
                breakdown,
                createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
            });
            await this.assessmentsRepository.upsertByParcelAndVersion(tenantId, projectId, parcel.id, versionName, {
                componentes: {
                    valorTerreno: result.landValue,
                    valorConstrucao: result.constructionValue,
                },
                memoriaCalculo: breakdown,
                valorVenalFinal: result.totalValue,
                createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
                updatedBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
            });
        }
        return {
            parcelId: parcel.id,
            versionId: version.id,
            landValuePerSqm,
            landFactor,
            constructionValuePerSqm: appliedConstructionValuePerSqm,
            constructionFactor,
            landValue: result.landValue,
            constructionValue: result.constructionValue,
            totalValue: result.totalValue,
            breakdown,
        };
    }
    async exportCsv(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const valuations = await this.repository.list(tenantId, String(resolvedProjectId));
        const parcels = await this.parcelsRepository.list(tenantId, {
            projectId: String(resolvedProjectId),
        });
        const parcelMap = new Map(parcels.map((parcel) => [parcel.id, parcel]));
        const rows = [
            [
                'parcelId',
                'sqlu',
                'inscricaoImobiliaria',
                'landValue',
                'constructionValue',
                'totalValue',
            ],
        ];
        valuations.forEach((valuation) => {
            const parcel = parcelMap.get(String(valuation.parcelId));
            rows.push([
                String(valuation.parcelId),
                parcel?.sqlu ?? '',
                parcel?.inscricaoImobiliaria ?? parcel?.inscription ?? '',
                valuation.landValue.toFixed(2),
                valuation.constructionValue.toFixed(2),
                valuation.totalValue.toFixed(2),
            ]);
        });
        return rows.map((row) => row.join(',')).join('\n');
    }
    async exportParcelsGeojson(tenantId, projectId, bbox) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const parcels = await this.parcelsRepository.list(tenantId, {
            projectId: String(resolvedProjectId),
            bbox,
        });
        const features = await Promise.all(parcels.map(async (parcel) => {
            const valuation = await this.repository.findLatestByParcel(tenantId, String(resolvedProjectId), parcel.id);
            return {
                type: 'Feature',
                id: parcel.id,
                geometry: parcel.geometry,
                properties: {
                    featureType: 'parcel',
                    parcelId: parcel.id,
                    sqlu: parcel.sqlu,
                    inscricaoImobiliaria: parcel.inscricaoImobiliaria ?? parcel.inscription,
                    inscription: parcel.inscription ?? parcel.inscricaoImobiliaria,
                    enderecoPrincipal: parcel.enderecoPrincipal,
                    address: parcel.mainAddress,
                    areaTerreno: parcel.areaTerreno ?? parcel.area,
                    area: parcel.area,
                    statusCadastral: parcel.statusCadastral ?? parcel.status,
                    status: parcel.status ?? parcel.statusCadastral,
                    zoneId: parcel.zoneId ? String(parcel.zoneId) : null,
                    faceId: parcel.faceId ? String(parcel.faceId) : null,
                    valor_venal: valuation?.totalValue ?? 0,
                },
            };
        }));
        return {
            type: 'FeatureCollection',
            features,
        };
    }
    async recalculateBatch(tenantId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const projectId = String(resolvedProjectId);
        const parcels = await this.parcelsRepository.list(tenantId, {
            projectId,
            zoneId: dto.zoneId,
            faceId: dto.faceId,
        });
        const version = dto.versao
            ? await this.versionsService.findByNameOrYear(tenantId, projectId, dto.versao)
            : await this.versionsService.getActiveOrDefault(tenantId, projectId);
        if (!version) {
            throw new common_1.BadRequestException('Versao PGV nao encontrada');
        }
        for (const parcel of parcels) {
            await this.calculate(tenantId, {
                parcelId: parcel.id,
                projectId,
                versionId: version.id,
                persist: true,
            }, userId);
        }
        return { processed: parcels.length };
    }
    async getCalculationTrace(tenantId, projectId, parcelId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const project = String(resolvedProjectId);
        const [valuations, assessments] = await Promise.all([
            this.repository.findByParcel(tenantId, project, parcelId),
            this.assessmentsRepository.findByParcel(tenantId, project, parcelId),
        ]);
        return {
            parcelId,
            valuations,
            assessments,
            latestValuation: valuations[0] ?? null,
            latestAssessment: assessments[0] ?? null,
        };
    }
    async getImpactReport(tenantId, projectId, baseVersionId, targetVersionId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const project = String(resolvedProjectId);
        const [base, target, baseVersion, targetVersion] = await Promise.all([
            this.repository.listByVersion(tenantId, project, baseVersionId),
            this.repository.listByVersion(tenantId, project, targetVersionId),
            this.versionsService.findById(tenantId, project, baseVersionId),
            this.versionsService.findById(tenantId, project, targetVersionId),
        ]);
        const baseMap = new Map(base.map((item) => [String(item.parcelId), item]));
        const targetMap = new Map(target.map((item) => [String(item.parcelId), item]));
        const parcelIds = Array.from(new Set([...baseMap.keys(), ...targetMap.keys()]));
        const changes = parcelIds.map((parcelId) => {
            const oldValue = baseMap.get(parcelId)?.totalValue ?? 0;
            const newValue = targetMap.get(parcelId)?.totalValue ?? 0;
            const delta = newValue - oldValue;
            const deltaPct = oldValue > 0 ? (delta / oldValue) * 100 : newValue > 0 ? 100 : 0;
            return {
                parcelId,
                oldValue,
                newValue,
                delta,
                deltaPct,
            };
        });
        const totalOld = changes.reduce((acc, item) => acc + item.oldValue, 0);
        const totalNew = changes.reduce((acc, item) => acc + item.newValue, 0);
        const totalDelta = totalNew - totalOld;
        const totalDeltaPct = totalOld > 0 ? (totalDelta / totalOld) * 100 : totalNew > 0 ? 100 : 0;
        return {
            baseVersion: {
                id: baseVersionId,
                name: baseVersion?.name ?? null,
            },
            targetVersion: {
                id: targetVersionId,
                name: targetVersion?.name ?? null,
            },
            summary: {
                parcelsCompared: changes.length,
                totalOld,
                totalNew,
                totalDelta,
                totalDeltaPct,
            },
            changes,
        };
    }
};
exports.ValuationsService = ValuationsService;
exports.ValuationsService = ValuationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [valuations_repository_1.ValuationsRepository,
        projects_service_1.ProjectsService,
        parcels_repository_1.ParcelsRepository,
        parcel_buildings_repository_1.ParcelBuildingsRepository,
        zones_repository_1.ZonesRepository,
        faces_repository_1.FacesRepository,
        factors_repository_1.FactorsRepository,
        factor_sets_repository_1.FactorSetsRepository,
        versions_service_1.VersionsService,
        assessments_repository_1.AssessmentsRepository])
], ValuationsService);
//# sourceMappingURL=valuations.service.js.map