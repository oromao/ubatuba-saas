import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyStatus = 'APTA' | 'PENDENTE' | 'IRREGULAR';
export type PendencyStatus = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
export type ReurbDeliverableKind =
  | 'PLANILHA_SINTESE'
  | 'BANCO_TABULADO_CSV'
  | 'BANCO_TABULADO_XLSX'
  | 'PACOTE_CARTORIO_ZIP';

@Schema({ timestamps: true, collection: 'tenant_configs' })
export class TenantConfig {
  @Prop({ required: true, type: Types.ObjectId, unique: true })
  tenantId!: Types.ObjectId;

  @Prop({ default: false })
  reurbEnabled!: boolean;

  @Prop({ type: [String], default: [] })
  requiredFamilyFields!: string[];

  @Prop({
    type: {
      templateVersion: { type: String, default: 'v1' },
      columns: {
        type: [
          {
            key: { type: String, required: true },
            label: { type: String, required: true },
            required: { type: Boolean, default: false },
          },
        ],
        default: [],
      },
    },
    default: {},
  })
  spreadsheet!: {
    templateVersion: string;
    columns: Array<{ key: string; label: string; required?: boolean }>;
  };

  @Prop({
    type: {
      familyFolder: { type: String, default: 'familias' },
      spreadsheetFolder: { type: String, default: 'planilha' },
      titlesFolder: { type: String, default: 'titulos' },
      approvedDocumentsFolder: { type: String, default: 'documentos_aprovados' },
      requiredDocumentTypes: { type: [String], default: [] },
    },
    default: {},
  })
  documentNaming!: {
    familyFolder: string;
    spreadsheetFolder: string;
    titlesFolder: string;
    approvedDocumentsFolder: string;
    requiredDocumentTypes: string[];
  };

  @Prop({
    type: {
      blockOnPendingDocumentIssues: { type: Boolean, default: true },
      requireAptaStatusForExports: { type: Boolean, default: false },
      requireAptaStatusForCartorioPackage: { type: Boolean, default: true },
      failOnMissingRequiredFields: { type: Boolean, default: true },
    },
    default: {},
  })
  validationRules!: {
    blockOnPendingDocumentIssues: boolean;
    requireAptaStatusForExports: boolean;
    requireAptaStatusForCartorioPackage: boolean;
    failOnMissingRequiredFields: boolean;
  };

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type TenantConfigDocument = TenantConfig & Document;
export const TenantConfigSchema = SchemaFactory.createForClass(TenantConfig);

@Schema({ timestamps: true, collection: 'reurb_families' })
export class ReurbFamily {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  familyCode!: string;

  @Prop({ required: true })
  nucleus!: string;

  @Prop({ required: true })
  responsibleName!: string;

  @Prop()
  cpf?: string;

  @Prop()
  address?: string;

  @Prop({ default: 1 })
  membersCount!: number;

  @Prop()
  monthlyIncome?: number;

  @Prop({ default: 'PENDENTE' })
  status!: FamilyStatus;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        documentType: { type: String, required: true },
        name: { type: String, required: true },
        key: { type: String, required: true },
        version: { type: Number, required: true, default: 1 },
        status: { type: String, required: true, default: 'PENDENTE' },
        metadata: { type: Object, default: {} },
        uploadedBy: { type: Types.ObjectId },
        uploadedAt: { type: String, required: true },
      },
    ],
    default: [],
  })
  documents!: Array<{
    id: string;
    documentType: string;
    name: string;
    key: string;
    version: number;
    status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
    metadata?: Record<string, unknown>;
    uploadedBy?: Types.ObjectId;
    uploadedAt: string;
  }>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ReurbFamilyDocument = ReurbFamily & Document;
export const ReurbFamilySchema = SchemaFactory.createForClass(ReurbFamily);
ReurbFamilySchema.index({ tenantId: 1, projectId: 1, familyCode: 1 }, { unique: true });
ReurbFamilySchema.index({ tenantId: 1, projectId: 1, status: 1, nucleus: 1 });

@Schema({ timestamps: true, collection: 'reurb_document_pendencies' })
export class ReurbDocumentPendency {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  familyId?: Types.ObjectId;

  @Prop({ required: true })
  nucleus!: string;

  @Prop({ required: true })
  documentType!: string;

  @Prop({ required: true })
  missingDocument!: string;

  @Prop()
  dueDate?: string;

  @Prop({ default: 'ABERTA' })
  status!: PendencyStatus;

  @Prop()
  observation?: string;

  @Prop({ required: true })
  responsible!: string;

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        previousStatus: { type: String },
        nextStatus: { type: String, required: true },
        observation: { type: String },
        actorId: { type: Types.ObjectId },
        at: { type: String, required: true },
      },
    ],
    default: [],
  })
  statusHistory!: Array<{
    id: string;
    previousStatus?: PendencyStatus;
    nextStatus: PendencyStatus;
    observation?: string;
    actorId?: Types.ObjectId;
    at: string;
  }>;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ReurbDocumentPendencyDocument = ReurbDocumentPendency & Document;
export const ReurbDocumentPendencySchema = SchemaFactory.createForClass(ReurbDocumentPendency);
ReurbDocumentPendencySchema.index({ tenantId: 1, projectId: 1, status: 1, nucleus: 1 });

@Schema({ timestamps: true, collection: 'reurb_deliverables' })
export class ReurbDeliverable {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  kind!: ReurbDeliverableKind;

  @Prop({ required: true })
  version!: number;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  hashSha256!: string;

  @Prop({ type: [Object], default: [] })
  validationErrors!: Array<{ code: string; message: string; field?: string; familyId?: string }>;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ required: true, type: Types.ObjectId })
  generatedBy!: Types.ObjectId;

  @Prop({ required: true })
  generatedAt!: string;
}

export type ReurbDeliverableDocument = ReurbDeliverable & Document;
export const ReurbDeliverableSchema = SchemaFactory.createForClass(ReurbDeliverable);
ReurbDeliverableSchema.index({ tenantId: 1, projectId: 1, kind: 1, version: -1 });

@Schema({ timestamps: true, collection: 'reurb_audit_logs' })
export class ReurbAuditLog {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  success!: boolean;

  @Prop({ type: [Object], default: [] })
  errors!: Array<{ code: string; message: string; field?: string; familyId?: string }>;

  @Prop({ type: Object, default: {} })
  details!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId })
  actorId?: Types.ObjectId;

  @Prop({ required: true })
  happenedAt!: string;
}

export type ReurbAuditLogDocument = ReurbAuditLog & Document;
export const ReurbAuditLogSchema = SchemaFactory.createForClass(ReurbAuditLog);
ReurbAuditLogSchema.index({ tenantId: 1, projectId: 1, action: 1, createdAt: -1 });
