import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'roads' })
export class Road {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  osmId!: number;

  @Prop()
  name?: string;

  @Prop()
  nome?: string;

  @Prop()
  highway?: string;

  @Prop()
  tipo?: string;

  @Prop({ type: Object, required: true })
  geometry!: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

export type RoadDocument = Road & Document;

export const RoadSchema = SchemaFactory.createForClass(Road);
RoadSchema.index({ tenantId: 1, projectId: 1 });
RoadSchema.index({ tenantId: 1, projectId: 1, osmId: 1 }, { unique: true });
RoadSchema.index({ geometry: '2dsphere' });
