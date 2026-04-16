import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermitBusinessStatus = 'ABERTO' | 'EM_ANALISE' | 'EXIGENCIA' | 'EM_TAXA' | 'EMITIDO' | 'ENCERRADO' | 'INDEFERIDO';

export type PermitBusinessStage =
  | 'ABERTURA'
  | 'ANALISE_TECNICA'
  | 'EXIGENCIAS'
  | 'PARECER'
  | 'TAXAS'
  | 'ASSINATURA'
  | 'EMISSAO'
  | 'ENCERRAMENTO'
  | 'INDEFERIDO';

@Schema({ timestamps: true, collection: 'permit_business_requests' })
export class PermitBusinessRequest {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  companyName!: string;

  @Prop({ required: true })
  cnpj!: string;

  @Prop({ required: true })
  activityDescription!: string;

  @Prop({ required: true, default: 'ABERTO' })
  status!: PermitBusinessStatus;

  @Prop({ required: true, default: 'ABERTURA' })
  currentStage!: PermitBusinessStage;

  @Prop({ type: String })
  responsibleDepartment?: string;

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: PermitBusinessStatus;
    stage?: PermitBusinessStage;
    action?: string;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  taxes!: Array<{
    id: string;
    description: string;
    amount: number;
    status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
    createdAt: string;
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

  @Prop()
  permitPdfKey?: string;

  @Prop({ type: Object })
  decision?: {
    kind: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
    reason?: string;
    at: string;
    actorId?: string;
  };
}

export type PermitBusinessRequestDocument = PermitBusinessRequest & Document;

export const PermitBusinessRequestSchema = SchemaFactory.createForClass(PermitBusinessRequest);
PermitBusinessRequestSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
