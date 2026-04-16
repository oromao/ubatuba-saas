import { CreatePgvScenarioDto } from './dto/create-pgv-scenario.dto';
import { PgvSimulationsService } from './pgv-simulations.service';
export declare class PgvSimulationsController {
    private readonly simulationsService;
    constructor(simulationsService: PgvSimulationsService);
    simulate(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreatePgvScenarioDto): Promise<{
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
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./pgv-scenario.schema").PgvScenarioDocument, {}, {}> & import("./pgv-scenario.schema").PgvScenario & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
