import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FactorCategory = 'LAND' | 'CONSTRUCTION';

@Schema({ timestamps: true, collection: 'pgv_factors' })
export class PgvFactor {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  category!: FactorCategory;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  value!: number;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type PgvFactorDocument = PgvFactor & Document;

export const PgvFactorSchema = SchemaFactory.createForClass(PgvFactor);
PgvFactorSchema.index({ tenantId: 1, projectId: 1, category: 1, key: 1 }, { unique: true });
