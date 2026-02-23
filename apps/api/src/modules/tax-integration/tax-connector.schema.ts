import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaxConnectorMode = 'REST_JSON' | 'CSV_UPLOAD' | 'SFTP';

@Schema({ timestamps: true, collection: 'tax_connectors' })
export class TaxConnector {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  mode!: TaxConnectorMode;

  @Prop({ type: Object, default: {} })
  config!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  fieldMapping!: Record<string, string>;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastSyncAt?: Date;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type TaxConnectorDocument = TaxConnector & Document;

export const TaxConnectorSchema = SchemaFactory.createForClass(TaxConnector);
TaxConnectorSchema.index({ tenantId: 1, projectId: 1, name: 1 }, { unique: true });

