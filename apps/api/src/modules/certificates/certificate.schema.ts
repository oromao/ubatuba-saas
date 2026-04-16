import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'certificates' })
export class Certificate {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  processId?: Types.ObjectId;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  subjectName!: string;

  @Prop()
  subjectDocument?: string;

  @Prop({ required: true })
  validationCode!: string;

  @Prop({ required: true })
  hashSha256!: string;

  @Prop({ required: true })
  pdfKey!: string;

  @Prop()
  payloadJson?: string;

  @Prop({ required: true, default: 'EMITIDA' })
  status!: 'EMITIDA' | 'CANCELADA';

  @Prop()
  issuedBy?: string;

  @Prop({ required: true })
  issuedAt!: string;
}

export type CertificateDocument = Certificate & Document;

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ tenantId: 1, validationCode: 1 }, { unique: true });
CertificateSchema.index({ tenantId: 1, processId: 1, createdAt: -1 });
