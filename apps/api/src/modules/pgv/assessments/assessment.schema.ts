import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'pgv_assessments' })
export class PgvAssessment {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop({ required: true })
  versao!: string;

  @Prop({ type: Object })
  componentes?: Record<string, unknown>;

  @Prop({ type: Object })
  memoriaCalculo?: Record<string, unknown>;

  @Prop({ required: true })
  valorVenalFinal!: number;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type PgvAssessmentDocument = PgvAssessment & Document;

export const PgvAssessmentSchema = SchemaFactory.createForClass(PgvAssessment);
PgvAssessmentSchema.index(
  { tenantId: 1, projectId: 1, parcelId: 1, versao: 1 },
  { unique: true },
);
