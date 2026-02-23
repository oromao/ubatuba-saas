import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'pgv_versions' })
export class PgvVersion {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type PgvVersionDocument = PgvVersion & Document;

export const PgvVersionSchema = SchemaFactory.createForClass(PgvVersion);
PgvVersionSchema.index({ tenantId: 1, projectId: 1, year: 1 }, { unique: true });
