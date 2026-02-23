import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../../common/utils/geo';

@Schema({ timestamps: true, collection: 'buildings' })
export class Building {
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
  building?: string;

  @Prop()
  tipo?: string;

  @Prop({ type: Object, required: true })
  geometry!: PolygonGeometry;
}

export type BuildingDocument = Building & Document;

export const BuildingSchema = SchemaFactory.createForClass(Building);
BuildingSchema.index({ tenantId: 1, projectId: 1 });
BuildingSchema.index({ tenantId: 1, projectId: 1, osmId: 1 }, { unique: true });
BuildingSchema.index({ geometry: '2dsphere' });
