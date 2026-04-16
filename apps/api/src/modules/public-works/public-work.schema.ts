import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicWorkStatus =
  | 'PLANEJADA'
  | 'CONTRATADA'
  | 'EM_EXECUCAO'
  | 'PARALISADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type PublicWorkStage =
  | 'CADASTRO'
  | 'PROJETO'
  | 'EXECUCAO'
  | 'FISCALIZACAO'
  | 'MEDICAO'
  | 'ENTREGA';

@Schema({ timestamps: true, collection: 'public_works' })
export class PublicWork {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  department!: string;

  @Prop({ required: true })
  location!: string;

  @Prop()
  contractor?: string;

  @Prop({ required: true, default: 'PLANEJADA' })
  status!: PublicWorkStatus;

  @Prop({ required: true, default: 'CADASTRO' })
  stage!: PublicWorkStage;

  @Prop({ default: 0 })
  progress!: number;

  @Prop({ default: 0 })
  budget?: number;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop({ type: [String], default: [] })
  evidenceKeys!: string[];

  @Prop({ type: [Object], default: [] })
  measurements!: Array<{
    id: string;
    label: string;
    quantity: number;
    unit: string;
    createdAt: string;
    actorId?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: PublicWorkStatus;
    stage: PublicWorkStage;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;
}

export type PublicWorkDocument = PublicWork & Document;

export const PublicWorkSchema = SchemaFactory.createForClass(PublicWork);
PublicWorkSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
