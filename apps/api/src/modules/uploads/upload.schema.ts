import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UploadStatus = 'MOCKED' | 'UPLOADED' | 'PUBLISHED';

@Schema({ timestamps: true })
export class Upload {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  status!: UploadStatus;

  @Prop()
  size?: number;

  @Prop()
  mimeType?: string;
}

export type UploadDocument = Upload & Document;

export const UploadSchema = SchemaFactory.createForClass(Upload);
UploadSchema.index({ tenantId: 1, status: 1 });
