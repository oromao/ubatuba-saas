import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Asset {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: Object, required: true })
  location!: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export type AssetDocument = Asset & Document;

export const AssetSchema = SchemaFactory.createForClass(Asset);
