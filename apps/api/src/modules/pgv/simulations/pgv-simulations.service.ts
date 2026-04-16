import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import { ParcelsRepository } from '../../ctm/parcels/parcels.repository';
import { ParcelBuildingsRepository } from '../../ctm/parcel-buildings/parcel-buildings.repository';
import { ValuationsService } from '../valuations/valuations.service';
import { PgvScenariosRepository } from './pgv-scenarios.repository';
import { CreatePgvScenarioDto } from './dto/create-pgv-scenario.dto';
import { ZonesRepository } from '../zones/zones.repository';
import { FacesRepository } from '../faces/faces.repository';
import { asObjectId } from '../../../common/utils/object-id';

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

@Injectable()
export class PgvSimulationsService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly parcelsRepository: ParcelsRepository,
    private readonly parcelBuildingsRepository: ParcelBuildingsRepository,
    private readonly valuationsService: ValuationsService,
    private readonly zonesRepository: ZonesRepository,
    private readonly facesRepository: FacesRepository,
    private readonly scenariosRepository: PgvScenariosRepository,
  ) {}

  async simulate(tenantId: string, dto: CreatePgvScenarioDto, userId?: string) {
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

    const impactedParcels = await Promise.all(
      parcels.map(async (parcel) => {
        const building = await this.parcelBuildingsRepository.findByParcel(tenantId, projectId, parcel.id);
        const current = await this.valuationsService.calculate(
          tenantId,
          {
            parcelId: parcel.id,
            projectId,
            persist: false,
            zoneId: dto.zoneId,
            faceId: dto.faceId,
          },
          userId,
        );
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
      }),
    );

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
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
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
        createdBy: userId ? asObjectId(userId) : undefined,
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

  async listScenarios(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.scenariosRepository.list(tenantId, String(resolvedProjectId));
  }

  private buildBreakdown(impactedParcels: Array<{ bairro?: string | null; logradouro?: string | null; zoneCode?: string | null; usage?: string | null; currentValue: number; proposedValue: number; delta: number }>) {
    const buckets = new Map<
      string,
      { type: 'zone' | 'neighborhood' | 'street' | 'usage'; key: string; label: string; parcels: number; currentValue: number; proposedValue: number; delta: number }
    >();

    const add = (type: 'zone' | 'neighborhood' | 'street' | 'usage', key: string, label: string, item: typeof impactedParcels[number]) => {
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
      if (item.zoneCode) add('zone', item.zoneCode, item.zoneCode, item);
      if (item.bairro) add('neighborhood', item.bairro, item.bairro, item);
      if (item.logradouro) add('street', item.logradouro, item.logradouro, item);
      if (item.usage) add('usage', item.usage, item.usage, item);
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
}
