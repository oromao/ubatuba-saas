import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'tax_sync_logs' })
export class TaxSyncLog {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  connectorId!: Types.ObjectId;

  @Prop({ required: true })
  status!: 'SUCESSO' | 'ERRO';

  @Prop({ required: true })
  trigger!: 'MANUAL' | 'TEST';

  @Prop({ type: Object, default: {} })
  summary!: {
    processed: number;
    inserted?: number;
    updated?: number;
    errors?: number;
    message?: string;
  };

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Types.ObjectId })
  startedBy?: Types.ObjectId;
}

export type TaxSyncLogDocument = TaxSyncLog & Document;

export const TaxSyncLogSchema = SchemaFactory.createForClass(TaxSyncLog);
TaxSyncLogSchema.index({ tenantId: 1, projectId: 1, connectorId: 1, createdAt: -1 });

