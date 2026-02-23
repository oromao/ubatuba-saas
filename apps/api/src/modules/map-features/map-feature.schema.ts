import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../common/utils/geo';

export type MapFeatureType = 'parcel' | 'building';

@Schema({ timestamps: true, collection: 'map_features' })
export class MapFeature {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop()
  tenantSlug?: string;

  @Prop()
  projectSlug?: string;

  @Prop({ required: true })
  featureType!: MapFeatureType;

  @Prop({ type: Object })
  properties?: Record<string, unknown>;

  @Prop({ type: Object, required: true })
  geometry!: PolygonGeometry;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type MapFeatureDocument = MapFeature & Document;

export const MapFeatureSchema = SchemaFactory.createForClass(MapFeature);
MapFeatureSchema.index({ tenantId: 1, projectId: 1, featureType: 1 });
MapFeatureSchema.index({ geometry: '2dsphere' });
