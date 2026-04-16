import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VistoriaDocument = Vistoria & Document;

@Schema({ timestamps: true })
export class Vistoria {
  @Prop({ required: true }) declare parcelId: string;
  @Prop({ required: true, enum: ['INICIAL', 'REINSPECAO', 'VISTORIA_ESPECIAL', 'CONFERENCIA'] }) declare tipo: string;
  @Prop({ required: true }) declare data: Date;
  @Prop({ default: '' }) declare observacoes: string;
  @Prop({ enum: ['RASCUNHO', 'ENVIADA', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA'], default: 'RASCUNHO' }) declare status: string;
  @Prop({ type: [String], default: [] }) declare fotos: string[];
  @Prop({ type: [{ status: String, observacao: String, userId: String, timestamp: Date }], default: [] }) declare historico: { status: string; observacao: string; userId: string; timestamp: Date }[];
  @Prop({ required: true }) declare tenantId: string;
  @Prop() declare operadorId: string;
}

export const VistoriaSchema = SchemaFactory.createForClass(Vistoria);
VistoriaSchema.index({ parcelId: 1, tenantId: 1 });
VistoriaSchema.index({ tenantId: 1, status: 1 });
