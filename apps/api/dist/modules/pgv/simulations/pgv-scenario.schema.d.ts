import { Document, Types } from 'mongoose';
export type PgvScenarioStage = 'DRAFT' | 'SIMULATED' | 'EXPORTED';
export declare class PgvScenario {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name?: string;
    summary: {
        parcelsEvaluated: number;
        totalCurrentValue: number;
        totalProposedValue: number;
        totalDelta: number;
        totalDeltaPct: number;
        estimatedAnnualArrecadationImpact: number;
    };
    filters: Record<string, unknown>;
    impactedParcels: Array<{
        parcelId: string;
        sqlu?: string;
        inscrição?: string;
        bairro?: string | null;
        logradouro?: string | null;
        zoneCode?: string | null;
        faceCode?: string | null;
        currentValue: number;
        proposedValue: number;
        delta: number;
        deltaPct: number;
    }>;
    territorialBreakdown: Array<{
        type: 'zone' | 'neighborhood' | 'street' | 'usage';
        key: string;
        label: string;
        parcels: number;
        currentValue: number;
        proposedValue: number;
        delta: number;
    }>;
    chartSeries: Array<{
        label: string;
        currentValue: number;
        proposedValue: number;
    }>;
    createdBy?: Types.ObjectId;
}
export type PgvScenarioDocument = PgvScenario & Document;
export declare const PgvScenarioSchema: import("mongoose").Schema<PgvScenario, import("mongoose").Model<PgvScenario, any, any, any, Document<unknown, any, PgvScenario, any, {}> & PgvScenario & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PgvScenario, Document<unknown, {}, import("mongoose").FlatRecord<PgvScenario>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PgvScenario> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
