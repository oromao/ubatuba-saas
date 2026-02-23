import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EnvironmentalAlert {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  level!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: Object, required: true })
  location!: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export type EnvironmentalAlertDocument = EnvironmentalAlert & Document;

export const EnvironmentalAlertSchema = SchemaFactory.createForClass(EnvironmentalAlert);
