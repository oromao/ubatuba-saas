import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PointGeometry } from '../../../common/utils/geo';

@Schema({ timestamps: true, collection: 'urban_furniture' })
export class UrbanFurniture {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  type!: string;

  @Prop()
  tipo?: string;

  @Prop({ type: Object, required: true })
  location!: PointGeometry;

  @Prop({ type: Object })
  geometry?: PointGeometry;

  @Prop()
  condition?: string;

  @Prop()
  estadoConservacao?: string;

  @Prop()
  notes?: string;

  @Prop()
  observacao?: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  fotoUrl?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type UrbanFurnitureDocument = UrbanFurniture & Document;

export const UrbanFurnitureSchema = SchemaFactory.createForClass(UrbanFurniture);
UrbanFurnitureSchema.index({ location: '2dsphere' });
