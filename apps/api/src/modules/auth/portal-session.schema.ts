import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'portal_sessions' })
export class PortalSession {
  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Object, default: {} })
  context!: Record<string, unknown>;
}

export type PortalSessionDocument = PortalSession & Document;
export const PortalSessionSchema = SchemaFactory.createForClass(PortalSession);
PortalSessionSchema.index({ tokenHash: 1 }, { unique: true });
