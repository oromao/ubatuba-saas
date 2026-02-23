import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'letter_batches' })
export class LetterBatch {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  templateId!: Types.ObjectId;

  @Prop({ required: true })
  templateName!: string;

  @Prop({ required: true })
  templateVersion!: number;

  @Prop({ required: true })
  protocol!: string;

  @Prop({ required: true })
  status!: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';

  @Prop({ type: Object, default: {} })
  filter!: {
    parcelWorkflowStatus?: string;
    parcelStatus?: string;
  };

  @Prop({ type: [Object], default: [] })
  letters!: Array<{
    id: string;
    parcelId: string;
    sqlu?: string;
    address?: string;
    status: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
    fileKey: string;
    generatedAt: string;
    deliveredAt?: string;
    returnedAt?: string;
  }>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type LetterBatchDocument = LetterBatch & Document;

export const LetterBatchSchema = SchemaFactory.createForClass(LetterBatch);
LetterBatchSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });

