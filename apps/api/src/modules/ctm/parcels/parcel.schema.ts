import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';

export type SourceType = 'DEMO' | 'DEMO_EXTERNAL' | 'OFFICIAL_SAMPLE' | 'MANUAL' | 'SHAPEFILE' | 'GEOJSON' | 'CSV_ENRICHMENT' | 'OFFICIAL_IMPORT';
export type ValidationStatus = 'VALID' | 'INVALID' | 'PENDING' | 'WARNING';
export type IptuStatus = 'QUITADO' | 'PARCELADO' | 'INADIMPLENTE' | 'ISENTO' | 'EXIGIVEL' | 'NAO_CADASTRADO';

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
  codigoImovel?: string;

  @Prop()
  setor?: string;

  @Prop()
  quadra?: string;

  @Prop()
  lote?: string;

  @Prop()
  cep?: string;

  @Prop()
  zoneamento?: string;

  @Prop()
  areaTerreno?: number;

  @Prop()
  area?: number;

  @Prop()
  areaConstruida?: number;

  @Prop()
  areaCartografica?: number;

  @Prop()
  valorVenalTerreno?: number;

  @Prop()
  valorVenalConstrucao?: number;

  @Prop()
  valorVenalTotal?: number;

  @Prop()
  iptuLancado?: number;

  @Prop()
  iptuPago?: number;

  @Prop()
  iptuEmAberto?: number;

  @Prop()
  statusIPTU?: IptuStatus;

  @Prop()
  exercicioIPTU?: number;

  @Prop()
  proprietarioNome?: string;

  @Prop()
  proprietarioDocumento?: string;

  @Prop({ default: 'DEMO' })
  sourceType?: SourceType;

  @Prop()
  municipalityName?: string;

  @Prop()
  municipalityCode?: string;

  @Prop()
  importBatchId?: string;

  @Prop({ default: false })
  isOfficial?: boolean;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ default: 'VALID' })
  validationStatus?: ValidationStatus;

  @Prop({ type: [String], default: [] })
  validationErrors?: string[];

  @Prop({ type: Object })
  centroid?: { type: string; coordinates: [number, number] };

  @Prop({ type: Object })
  bbox?: { minX: number; minY: number; maxX: number; maxY: number };

  @Prop({ type: Object })
  geometry!: PolygonGeometry;

  @Prop({ type: Object })
  rawProperties?: Record<string, any>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

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
}

export type ParcelDocument = Parcel & Document;

export const ParcelSchema = SchemaFactory.createForClass(Parcel);
ParcelSchema.index({ tenantId: 1, projectId: 1, sqlu: 1 }, { unique: true });
ParcelSchema.index({ tenantId: 1, projectId: 1, inscription: 1 });
ParcelSchema.index({ tenantId: 1, projectId: 1, inscricaoImobiliaria: 1 });
ParcelSchema.index({ tenantId: 1, projectId: 1, updatedAt: -1 });
ParcelSchema.index({ geometry: '2dsphere' });
ParcelSchema.index({ sourceType: 1 });
ParcelSchema.index({ isOfficial: 1 });
ParcelSchema.index({ importBatchId: 1 });
ParcelSchema.index({ statusIPTU: 1 });
ParcelSchema.index({ zoneamento: 1 });
ParcelSchema.index({ municipalityName: 1 });
ParcelSchema.index({ setor: 1, quadra: 1, lote: 1 });
