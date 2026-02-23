import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';

type EnderecoPrincipal = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
};

@Schema({ timestamps: true, collection: 'parcels' })
export class Parcel {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  sqlu!: string;

  @Prop()
  inscricaoImobiliaria?: string;

  @Prop()
  inscription?: string;

  @Prop({ type: Object })
  enderecoPrincipal?: EnderecoPrincipal;

  @Prop()
  mainAddress?: string;

  @Prop()
  statusCadastral?: 'ATIVO' | 'INATIVO' | 'CONFLITO';

  @Prop()
  status?: string;

  @Prop()
  observacoes?: string;

  @Prop({ default: 'PENDENTE' })
  workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';

  @Prop({ type: [String], default: [] })
  pendingIssues?: string[];

  @Prop({ type: Types.ObjectId })
  logradouroId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  zoneId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  faceId?: Types.ObjectId;

  @Prop()
  areaTerreno?: number;

  @Prop()
  area?: number;

  @Prop({ type: Object, required: true })
  geometry!: PolygonGeometry;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ParcelDocument = Parcel & Document;

export const ParcelSchema = SchemaFactory.createForClass(Parcel);
ParcelSchema.index({ tenantId: 1, projectId: 1, sqlu: 1 }, { unique: true });
ParcelSchema.index({ tenantId: 1, projectId: 1, inscription: 1 });
ParcelSchema.index({ tenantId: 1, projectId: 1, inscricaoImobiliaria: 1 });
ParcelSchema.index({ tenantId: 1, projectId: 1, updatedAt: -1 });
ParcelSchema.index({ geometry: '2dsphere' });
