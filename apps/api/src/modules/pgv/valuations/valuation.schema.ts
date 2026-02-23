import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'pgv_valuations' })
export class PgvValuation {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  versionId!: Types.ObjectId;

  @Prop({ required: true })
  landValuePerSqm!: number;

  @Prop({ required: true })
  landFactor!: number;

  @Prop({ required: true })
  constructionValuePerSqm!: number;

  @Prop({ required: true })
  constructionFactor!: number;

  @Prop({ required: true })
  landValue!: number;

  @Prop({ required: true })
  constructionValue!: number;

  @Prop({ required: true })
  totalValue!: number;

  @Prop({ type: Object })
  breakdown?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type PgvValuationDocument = PgvValuation & Document;

export const PgvValuationSchema = SchemaFactory.createForClass(PgvValuation);
PgvValuationSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, versionId: 1 });
