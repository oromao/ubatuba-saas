import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermitWorkStatus =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'EXIGENCIA'
  | 'EM_TAXA'
  | 'EM_ASSINATURA'
  | 'EMISSO'
  | 'CONCLUIDO'
  | 'INDEFERIDO';

export type PermitWorkStage =
  | 'ABERTURA'
  | 'ANALISE_TECNICA'
  | 'EXIGENCIAS'
  | 'PARECER'
  | 'TAXAS'
  | 'ASSINATURA'
  | 'EMISSAO'
  | 'ENCERRAMENTO'
  | 'INDEFERIDO';

@Schema({ timestamps: true, collection: 'permit_work_requests' })
export class PermitWorkRequest {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  applicantName!: string;

  @Prop({ required: true })
  subjectAddress!: string;

  @Prop({ required: true, default: 'ABERTO' })
  status!: PermitWorkStatus;

  @Prop({ required: true, default: 'ABERTURA' })
  currentStage!: PermitWorkStage;

  @Prop({ type: String })
  responsibleDepartment?: string;

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: PermitWorkStatus;
    stage?: PermitWorkStage;
    action?: string;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  requirements!: Array<{
    id: string;
    title: string;
    status: 'ABERTA' | 'ATENDIDA';
    notes?: string;
    responsibleDepartment?: string;
    reviewedBy?: string;
    createdAt: string;
    updatedAt?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  evidences!: Array<{
    id: string;
    title: string;
    note?: string;
    fileName?: string;
    createdAt: string;
    createdBy?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  invoices!: Array<{
    id: string;
    description: string;
    amount: number;
    status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
    createdAt: string;
  }>;

  @Prop()
  decisionPdfKey?: string;

  @Prop({ type: Object })
  decision?: {
    kind: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
    reason?: string;
    at: string;
    actorId?: string;
  };
}

export type PermitWorkRequestDocument = PermitWorkRequest & Document;

export const PermitWorkRequestSchema = SchemaFactory.createForClass(PermitWorkRequest);
PermitWorkRequestSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
