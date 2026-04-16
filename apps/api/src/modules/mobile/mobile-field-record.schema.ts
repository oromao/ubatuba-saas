import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'mobile_field_records' })
export class MobileFieldRecord {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop()
  clientId?: string;

  @Prop({ type: Object, default: {} })
  checklist!: {
    occupancyChecked?: boolean;
    addressChecked?: boolean;
    infrastructureChecked?: boolean;
    notes?: string;
  };

  @Prop({ type: Object })
  location?: {
    lat: number;
    lng: number;
  };

  @Prop()
  photoBase64?: string;

  @Prop()
  parcelUpdatedAt?: string;

  @Prop({ type: [Object], default: [] })
  evidences!: Array<{
    clientId: string;
    fileName?: string;
    mimeType?: string;
    base64: string;
    checksum?: string;
    capturedAt?: string;
    size?: number;
    status?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
    retries?: number;
    lastError?: string;
    lastAttemptAt?: string;
  }>;

  @Prop({ default: 'RECEBIDO' })
  syncStatus!: 'RECEBIDO' | 'PROCESSADO' | 'CONFLITO';

  @Prop({ default: 0 })
  syncAttempts!: number;

  @Prop()
  syncedAt?: string;

  @Prop()
  syncError?: string;

  @Prop({ type: Object })
  syncContext?: {
    clientParcelUpdatedAt?: string;
    serverParcelUpdatedAt?: string;
  };

  @Prop({ type: [Object], default: [] })
  syncTimeline!: Array<{
    at: string;
    status: 'RECEBIDO' | 'PROCESSADO' | 'CONFLITO' | 'ERRO';
    message: string;
    actorId?: string;
  }>;

  @Prop({ type: Types.ObjectId })
  syncedBy?: Types.ObjectId;
}

export type MobileFieldRecordDocument = MobileFieldRecord & Document;

export const MobileFieldRecordSchema = SchemaFactory.createForClass(MobileFieldRecord);
MobileFieldRecordSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, createdAt: -1 });
MobileFieldRecordSchema.index({ tenantId: 1, projectId: 1, clientId: 1 }, { unique: true, sparse: true });
