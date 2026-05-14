import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'lgpd_audit' })
export class LgpdAudit {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  resourceType!: string;

  @Prop({ required: true })
  resourceId!: string;

  @Prop({ type: [String] })
  fields?: string[];

  @Prop()
  actorId?: string;

  @Prop()
  actorRole?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  reason?: string;

  @Prop()
  consentId?: string;

  @Prop({ default: false })
  anonymized!: boolean;
}

export type LgpdAuditDocument = LgpdAudit & Document;
export const LgpdAuditSchema = SchemaFactory.createForClass(LgpdAudit);
LgpdAuditSchema.index({ tenantId: 1, createdAt: -1 });
LgpdAuditSchema.index({ resourceType: 1, resourceId: 1 });
