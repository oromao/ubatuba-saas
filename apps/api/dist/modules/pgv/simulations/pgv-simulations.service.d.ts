import { ProjectsService } from '../../projects/projects.service';
import { ParcelsRepository } from '../../ctm/parcels/parcels.repository';
import { ParcelBuildingsRepository } from '../../ctm/parcel-buildings/parcel-buildings.repository';
import { ValuationsService } from '../valuations/valuations.service';
import { PgvScenariosRepository } from './pgv-scenarios.repository';
import { CreatePgvScenarioDto } from './dto/create-pgv-scenario.dto';
import { ZonesRepository } from '../zones/zones.repository';
import { FacesRepository } from '../faces/faces.repository';
export declare class PgvSimulationsService {
    private readonly projectsService;
    private readonly parcelsRepository;
    private readonly parcelBuildingsRepository;
    private readonly valuationsService;
    private readonly zonesRepository;
    private readonly facesRepository;
    private readonly scenariosRepository;
    constructor(projectsService: ProjectsService, parcelsRepository: ParcelsRepository, parcelBuildingsRepository: ParcelBuildingsRepository, valuationsService: ValuationsService, zonesRepository: ZonesRepository, facesRepository: FacesRepository, scenariosRepository: PgvScenariosRepository);
    simulate(tenantId: string, dto: CreatePgvScenarioDto, userId?: string): Promise<{
        summary: {
            parcelsEvaluated: number;
            totalCurrentValue: number;
            totalProposedValue: number;
            totalDelta: number;
            totalDeltaPct: number;
            estimatedAnnualArrecadationImpact: number;
        };
        filters: {
            zoneId: string | null;
            faceId: string | null;
            q: string | null;
            bairro: string | null;
            logradouro: string | null;
            uso: string | null;
            padraoConstrutivo: string | null;
            proposedLandMultiplier: number;
            proposedConstructionMultiplier: number;
        };
        chartSeries: {
            label: string;
            currentValue: number;
            proposedValue: number;
        }[];
        territorialBreakdown: {
            currentValue: number;
            proposedValue: number;
            delta: number;
            type: "zone" | "neighborhood" | "street" | "usage";
            key: string;
            label: string;
            parcels: number;
        }[];
        impactedParcels: {
            parcelId: any;
            sqlu: string;
            inscrição: string | undefined;
            bairro: string | null;
            logradouro: string | null;
            zoneCode: string | null;
            faceCode: string | null;
            usage: string | null;
            pattern: string | null;
            currentValue: number;
            proposedValue: number;
            delta: number;
            deltaPct: number;
        }[];
        highlights: {
            withPositiveImpact: number;
            withHigherUrbanPressure: number;
        };
    }>;
    listScenarios(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./pgv-scenario.schema").PgvScenarioDocument, {}, {}> & import("./pgv-scenario.schema").PgvScenario & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    private buildBreakdown;
}
