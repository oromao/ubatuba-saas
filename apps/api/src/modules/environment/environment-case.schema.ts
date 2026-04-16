import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnvironmentCaseStatus = 'ABERTO' | 'EM_ANALISE' | 'EM_CAMPO' | 'EVIDENCIA' | 'LAUDO' | 'OS' | 'ENCERRADO' | 'INDEFERIDO';

@Schema({ timestamps: true, collection: 'environment_cases' })
export class EnvironmentCase {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: 'APP' | 'PODA' | 'ARVORE' | 'LAUDO' | 'OS' | 'LICENCA';

  @Prop({ required: true })
  status!: EnvironmentCaseStatus;

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: EnvironmentCaseStatus;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;

  @Prop({ type: [String], default: [] })
  evidenceKeys!: string[];

  @Prop({ type: [Object], default: [] })
  tasks!: Array<{
    id: string;
    title: string;
    status: 'ABERTA' | 'ATENDIDA';
    createdAt: string;
  }>;

  @Prop()
  reportPdfKey?: string;
}

export type EnvironmentCaseDocument = EnvironmentCase & Document;
export const EnvironmentCaseSchema = SchemaFactory.createForClass(EnvironmentCase);
EnvironmentCaseSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
