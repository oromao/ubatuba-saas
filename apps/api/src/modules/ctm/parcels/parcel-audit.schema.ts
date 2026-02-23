import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'parcel_audit_logs' })
export class ParcelAuditLog {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ type: Object, default: {} })
  before?: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  after?: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  diff?: Record<string, { before: unknown; after: unknown }>;

  @Prop({ type: Types.ObjectId })
  actorId?: Types.ObjectId;
}

export type ParcelAuditLogDocument = ParcelAuditLog & Document;

export const ParcelAuditLogSchema = SchemaFactory.createForClass(ParcelAuditLog);
ParcelAuditLogSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, createdAt: -1 });

