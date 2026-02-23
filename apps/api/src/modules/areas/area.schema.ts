import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Area {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  group!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ type: Object, required: true })
  geometry!: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export type AreaDocument = Area & Document;

export const AreaSchema = SchemaFactory.createForClass(Area);
AreaSchema.index({ tenantId: 1, group: 1 });
AreaSchema.index({ geometry: '2dsphere' });
