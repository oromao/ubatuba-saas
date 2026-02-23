import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LineGeometry } from '../../../common/utils/geo';

@Schema({ timestamps: true, collection: 'pgv_faces' })
export class PgvFace {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  code!: string;

  @Prop({ type: Types.ObjectId })
  logradouroId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  zoneId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  zonaValorId?: Types.ObjectId;

  @Prop({ required: true })
  landValuePerSqm!: number;

  @Prop()
  valorTerrenoM2?: number;

  @Prop({ type: Object })
  metadados?: {
    lado?: string;
    trecho?: string;
    observacoes?: string;
  };

  @Prop({ type: Object, required: true })
  geometry!: LineGeometry;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type PgvFaceDocument = PgvFace & Document;

export const PgvFaceSchema = SchemaFactory.createForClass(PgvFace);
PgvFaceSchema.index({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
PgvFaceSchema.index({ geometry: '2dsphere' });
