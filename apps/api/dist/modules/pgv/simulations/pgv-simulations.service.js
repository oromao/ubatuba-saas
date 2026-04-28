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
exports.PgvSimulationsService = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("../../projects/projects.service");
const parcels_repository_1 = require("../../ctm/parcels/parcels.repository");
const parcel_buildings_repository_1 = require("../../ctm/parcel-buildings/parcel-buildings.repository");
const valuations_service_1 = require("../valuations/valuations.service");
const pgv_scenarios_repository_1 = require("./pgv-scenarios.repository");
const zones_repository_1 = require("../zones/zones.repository");
const faces_repository_1 = require("../faces/faces.repository");
const object_id_1 = require("../../../common/utils/object-id");
function roundCurrency(value) {
    return Number(value.toFixed(2));
}
let PgvSimulationsService = class PgvSimulationsService {
    constructor(projectsService, parcelsRepository, parcelBuildingsRepository, valuationsService, zonesRepository, facesRepository, scenariosRepository) {
        this.projectsService = projectsService;
        this.parcelsRepository = parcelsRepository;
        this.parcelBuildingsRepository = parcelBuildingsRepository;
        this.valuationsService = valuationsService;
        this.zonesRepository = zonesRepository;
        this.facesRepository = facesRepository;
        this.scenariosRepository = scenariosRepository;
    }
    async simulate(tenantId, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const projectId = String(resolvedProjectId);
        const parcels = await this.parcelsRepository.list(tenantId, {
            projectId,
            zoneId: dto.zoneId,
            faceId: dto.faceId,
            q: dto.q,
        });
        const zoneLookup = dto.zoneId
            ? await this.zonesRepository.findById(tenantId, projectId, dto.zoneId)
            : null;
        const faceLookup = dto.faceId
            ? await this.facesRepository.findById(tenantId, projectId, dto.faceId)
            : null;
        const impactedParcels = await Promise.all(parcels.map(async (parcel) => {
            const building = await this.parcelBuildingsRepository.findByParcel(tenantId, projectId, parcel.id);
            const current = await this.valuationsService.calculate(tenantId, {
                parcelId: parcel.id,
                projectId,
                persist: false,
                zoneId: dto.zoneId,
                faceId: dto.faceId,
            }, userId);
            const proposedLandMultiplier = dto.proposedLandMultiplier ?? 1.08;
            const proposedConstructionMultiplier = dto.proposedConstructionMultiplier ?? 1.05;
            const proposedLandValue = current.landValue * proposedLandMultiplier;
            const proposedConstructionValue = current.constructionValue * proposedConstructionMultiplier;
            const proposedValue = proposedLandValue + proposedConstructionValue;
            const delta = proposedValue - current.totalValue;
            const deltaPct = current.totalValue > 0 ? (delta / current.totalValue) * 100 : 0;
            return {
                parcelId: parcel.id,
                sqlu: parcel.sqlu,
                inscrição: parcel.inscricaoImobiliaria ?? parcel.inscription ?? undefined,
                bairro: parcel.enderecoPrincipal?.bairro ?? null,
                logradouro: parcel.enderecoPrincipal?.logradouro ?? parcel.mainAddress ?? null,
                zoneCode: zoneLookup?.code ?? null,
                faceCode: faceLookup?.code ?? null,
                usage: building?.uso ?? building?.useType ?? null,
                pattern: building?.padraoConstrutivo ?? building?.constructionStandard ?? null,
                currentValue: roundCurrency(current.totalValue),
                proposedValue: roundCurrency(proposedValue),
                delta: roundCurrency(delta),
                deltaPct: roundCurrency(deltaPct),
            };
        }));
        const totalCurrentValue = impactedParcels.reduce((acc, item) => acc + item.currentValue, 0);
        const totalProposedValue = impactedParcels.reduce((acc, item) => acc + item.proposedValue, 0);
        const totalDelta = totalProposedValue - totalCurrentValue;
        const totalDeltaPct = totalCurrentValue > 0 ? (totalDelta / totalCurrentValue) * 100 : 0;
        const estimatedAnnualArrecadationImpact = totalDelta * 0.03;
        const territorialBreakdown = this.buildBreakdown(impactedParcels);
        const chartSeries = [
            { label: 'Atual', currentValue: roundCurrency(totalCurrentValue), proposedValue: 0 },
            { label: 'Proposto', currentValue: 0, proposedValue: roundCurrency(totalProposedValue) },
        ];
        const summary = {
            parcelsEvaluated: impactedParcels.length,
            totalCurrentValue: roundCurrency(totalCurrentValue),
            totalProposedValue: roundCurrency(totalProposedValue),
            totalDelta: roundCurrency(totalDelta),
            totalDeltaPct: roundCurrency(totalDeltaPct),
            estimatedAnnualArrecadationImpact: roundCurrency(estimatedAnnualArrecadationImpact),
        };
        if (dto.persist) {
            await this.scenariosRepository.create({
                tenantId: (0, object_id_1.asObjectId)(tenantId),
                projectId: (0, object_id_1.asObjectId)(projectId),
                name: dto.name?.trim() || 'Cenario PGV',
                summary,
                filters: {
                    zoneId: dto.zoneId ?? null,
                    faceId: dto.faceId ?? null,
                    q: dto.q ?? null,
                    bairro: dto.bairro ?? null,
                    logradouro: dto.logradouro ?? null,
                    uso: dto.uso ?? null,
                    padraoConstrutivo: dto.padraoConstrutivo ?? null,
                    proposedLandMultiplier: dto.proposedLandMultiplier ?? 1.08,
                    proposedConstructionMultiplier: dto.proposedConstructionMultiplier ?? 1.05,
                },
                impactedParcels,
                territorialBreakdown,
                chartSeries,
                createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
            });
        }
        return {
            summary,
            filters: {
                zoneId: dto.zoneId ?? null,
                faceId: dto.faceId ?? null,
                q: dto.q ?? null,
                bairro: dto.bairro ?? null,
                logradouro: dto.logradouro ?? null,
                uso: dto.uso ?? null,
                padraoConstrutivo: dto.padraoConstrutivo ?? null,
                proposedLandMultiplier: dto.proposedLandMultiplier ?? 1.08,
                proposedConstructionMultiplier: dto.proposedConstructionMultiplier ?? 1.05,
            },
            chartSeries,
            territorialBreakdown,
            impactedParcels: impactedParcels.sort((a, b) => b.delta - a.delta),
            highlights: {
                withPositiveImpact: impactedParcels.filter((item) => item.delta > 0).length,
                withHigherUrbanPressure: impactedParcels.filter((item) => item.deltaPct >= 5).length,
            },
        };
    }
    async listScenarios(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.scenariosRepository.list(tenantId, String(resolvedProjectId));
    }
    buildBreakdown(impactedParcels) {
        const buckets = new Map();
        const add = (type, key, label, item) => {
            const existing = buckets.get(`${type}:${key}`) ?? {
                type,
                key,
                label,
                parcels: 0,
                currentValue: 0,
                proposedValue: 0,
                delta: 0,
            };
            existing.parcels += 1;
            existing.currentValue += item.currentValue;
            existing.proposedValue += item.proposedValue;
            existing.delta += item.delta;
            buckets.set(`${type}:${key}`, existing);
        };
        for (const item of impactedParcels) {
            if (item.zoneCode)
                add('zone', item.zoneCode, item.zoneCode, item);
            if (item.bairro)
                add('neighborhood', item.bairro, item.bairro, item);
            if (item.logradouro)
                add('street', item.logradouro, item.logradouro, item);
            if (item.usage)
                add('usage', item.usage, item.usage, item);
        }
        return Array.from(buckets.values())
            .map((item) => ({
            ...item,
            currentValue: roundCurrency(item.currentValue),
            proposedValue: roundCurrency(item.proposedValue),
            delta: roundCurrency(item.delta),
        }))
            .sort((a, b) => b.delta - a.delta)
            .slice(0, 16);
    }
};
exports.PgvSimulationsService = PgvSimulationsService;
exports.PgvSimulationsService = PgvSimulationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        parcels_repository_1.ParcelsRepository,
        parcel_buildings_repository_1.ParcelBuildingsRepository,
        valuations_service_1.ValuationsService,
        zones_repository_1.ZonesRepository,
        faces_repository_1.FacesRepository,
        pgv_scenarios_repository_1.PgvScenariosRepository])
], PgvSimulationsService);
//# sourceMappingURL=pgv-simulations.service.js.map