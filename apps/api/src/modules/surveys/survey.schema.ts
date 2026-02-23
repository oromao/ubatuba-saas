import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SurveyType = 'AEROFOTO_RGB_5CM' | 'MOBILE_LIDAR_360';
export type SurveyPipelineStatus = 'RECEBIDO' | 'VALIDANDO' | 'PUBLICADO' | 'REPROVADO';

@Schema({ timestamps: true, collection: 'surveys' })
export class Survey {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  type!: SurveyType;

  @Prop({ required: true, default: 'RECEBIDO' })
  pipelineStatus!: SurveyPipelineStatus;

  @Prop({ type: Object, required: true })
  metadata!: {
    municipality: string;
    surveyDate: string;
    gsdCm?: number;
    srcDatum: string;
    precision?: string;
    supplier: string;
    technicalResponsibleId?: string;
    observations?: string;
    bbox?: [number, number, number, number];
    areaGeometry?: Record<string, unknown>;
  };

  @Prop({ type: [Object], default: [] })
  files!: Array<{
    id: string;
    name: string;
    category: string;
    key: string;
    mimeType?: string;
    size?: number;
    uploadedAt: string;
  }>;

  @Prop({ type: Object, default: {} })
  qa!: {
    coverageOk?: boolean;
    georeferencingOk?: boolean;
    qualityOk?: boolean;
    comments?: string;
    checkedBy?: string;
    checkedAt?: string;
  };

  @Prop({ type: Object })
  publication?: {
    workspace: string;
    layerName: string;
    store: string;
    publishedAt: string;
  };

  @Prop({ type: [Object], default: [] })
  auditLog!: Array<{
    id: string;
    actorId?: string;
    action: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type SurveyDocument = Survey & Document;

export const SurveySchema = SchemaFactory.createForClass(Survey);
SurveySchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });

