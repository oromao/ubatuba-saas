import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';

export type SubdivisionType = 'DESMEMBRAMENTO' | 'LOTEAMENTO' | 'REMEMBRAMENTO';
export type SubdivisionStatus = 'RASCUNHO' | 'PROTOCOLADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';

export interface ChildDefinition {
  sqlu: string;
  geometry: PolygonGeometry;
  area: number;
  areaPercent: number;
  mainAddress?: string;
  inscricaoImobiliaria?: string;
}

@Schema({ timestamps: true, collection: 'subdivision_requests' })
export class ParcelSubdivision {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parentParcelId!: Types.ObjectId;

  @Prop({ required: true })
  tipo!: SubdivisionType;

  @Prop({ default: 'RASCUNHO' })
  status!: SubdivisionStatus;

  @Prop()
  numeroProcesso?: string;

  @Prop()
  motivo?: string;

  @Prop()
  observacoes?: string;

  @Prop({ type: Object })
  requerente?: {
    nome: string;
    documento: string;
    endereco?: string;
  };

  @Prop({ type: Array, required: true })
  childDefinitions!: ChildDefinition[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  childParcelIds?: Types.ObjectId[];

  @Prop({ type: [{ tipo: String, url: String, nome: String }] })
  documents?: Array<{ tipo: string; url: string; nome: string }>;

  @Prop({ type: Types.ObjectId })
  aprovadoPor?: Types.ObjectId;

  @Prop()
  aprovadoEm?: Date;

  @Prop({ type: Types.ObjectId })
  rejeitadoPor?: Types.ObjectId;

  @Prop()
  rejeitadoEm?: Date;

  @Prop()
  motivoRejeicao?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ParcelSubdivisionDocument = ParcelSubdivision & Document;

export const ParcelSubdivisionSchema = SchemaFactory.createForClass(ParcelSubdivision);
ParcelSubdivisionSchema.index({ tenantId: 1, projectId: 1 });
ParcelSubdivisionSchema.index({ tenantId: 1, parentParcelId: 1 });
ParcelSubdivisionSchema.index({ tenantId: 1, status: 1 });
ParcelSubdivisionSchema.index({ numeroProcesso: 1 }, { sparse: true });
