import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnvironmentalEventType =
  | 'DESLIZAMENTO'
  | 'INUNDACAO'
  | 'QUEIMADA'
  | 'SUPRESSAO_VEGETACAO'
  | 'SOLO_EXPOSTO'
  | 'PRECIPITACAO_EXTREMA'
  | 'VENTO_FORTE'
  | 'SENSOR_OFFLINE';

export type EnvironmentalSourceMode = 'MANUAL' | 'SENSOR' | 'SATELLITE' | 'API';

@Schema({ timestamps: true, collection: 'environmental_events' })
export class EnvironmentalEvent {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  type!: EnvironmentalEventType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  severity!: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

  @Prop({ required: true })
  stage!: 'INGESTAO' | 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO';

  @Prop()
  classification?: 'NOVA_EDIFICACAO' | 'AUMENTO_EDIFICACAO' | 'DEMOLICAO' | 'SOLO_EXPOSTO' | 'SUPRESSAO_VEGETACAO' | 'QUEIMADA' | 'DESCARTE_IRREGULAR' | 'LOTE_SEM_MANUTENCAO' | 'OCUPACAO_IRREGULAR';

  @Prop({ type: Object, required: true })
  location!: { type: 'Point'; coordinates: [number, number] };

  @Prop({ type: [String], default: [] })
  evidenceKeys!: string[];

  @Prop({ type: [Object], default: [] })
  timeline!: Array<{
    id: string;
    stage: EnvironmentalEvent['stage'];
    message: string;
    createdAt: string;
    actorId?: string;
  }>;

  @Prop()
  source?: string;

  @Prop({ default: 'MANUAL' })
  sourceMode!: EnvironmentalSourceMode;

  @Prop()
  sourceAdapter?: string;

  @Prop()
  externalReference?: string;

  @Prop()
  observedAt?: string;

  @Prop()
  assignedTo?: string;

  @Prop()
  notifiedAt?: string;

  @Prop()
  resolvedAt?: string;
}

export type EnvironmentalEventDocument = EnvironmentalEvent & Document;
export const EnvironmentalEventSchema = SchemaFactory.createForClass(EnvironmentalEvent);
