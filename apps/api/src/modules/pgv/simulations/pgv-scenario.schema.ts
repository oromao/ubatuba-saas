import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PgvScenarioStage = 'DRAFT' | 'SIMULATED' | 'EXPORTED';

@Schema({ timestamps: true, collection: 'pgv_scenarios' })
export class PgvScenario {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop()
  name?: string;

  @Prop({ type: Object, required: true })
  summary!: {
    parcelsEvaluated: number;
    totalCurrentValue: number;
    totalProposedValue: number;
    totalDelta: number;
    totalDeltaPct: number;
    estimatedAnnualArrecadationImpact: number;
  };

  @Prop({ type: Object, required: true })
  filters!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  impactedParcels!: Array<{
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

  @Prop({ type: [Object], default: [] })
  territorialBreakdown!: Array<{
    type: 'zone' | 'neighborhood' | 'street' | 'usage';
    key: string;
    label: string;
    parcels: number;
    currentValue: number;
    proposedValue: number;
    delta: number;
  }>;

  @Prop({ type: [Object], default: [] })
  chartSeries!: Array<{
    label: string;
    currentValue: number;
    proposedValue: number;
  }>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type PgvScenarioDocument = PgvScenario & Document;

export const PgvScenarioSchema = SchemaFactory.createForClass(PgvScenario);
PgvScenarioSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });
