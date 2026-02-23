import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';

@Schema({ timestamps: true, collection: 'pgv_zones' })
export class PgvZone {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  nome?: string;

  @Prop()
  description?: string;

  @Prop()
  descricao?: string;

  @Prop({ required: true })
  baseLandValue!: number;

  @Prop()
  valorBaseTerrenoM2?: number;

  @Prop({ required: true })
  baseConstructionValue!: number;

  @Prop()
  valorBaseConstrucaoM2?: number;

  @Prop({ type: Object, required: true })
  geometry!: PolygonGeometry;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type PgvZoneDocument = PgvZone & Document;

export const PgvZoneSchema = SchemaFactory.createForClass(PgvZone);
PgvZoneSchema.index({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
PgvZoneSchema.index({ geometry: '2dsphere' });
