import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LayerType = 'raster' | 'vector' | 'basemap';
export type LayerSource = 'geoserver' | 'api' | 'external';
export type LayerGeometryType = 'polygon' | 'line' | 'point';

@Schema({ timestamps: true })
export class Layer {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  group!: string;

  @Prop({ required: true })
  type!: LayerType;

  @Prop({ required: true })
  source!: LayerSource;

  @Prop({ type: Object })
  geoserver?: {
    workspace: string;
    layerName: string;
  };

  @Prop()
  tileUrl?: string;

  @Prop()
  dataUrl?: string;

  @Prop({ default: 1 })
  opacity!: number;

  @Prop({ default: true })
  visible!: boolean;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: Object })
  style?: {
    fillColor?: string;
    lineColor?: string;
    lineWidth?: number;
    labelField?: string;
  };

  @Prop()
  geometryType?: LayerGeometryType;

  @Prop()
  minZoom?: number;

  @Prop()
  maxZoom?: number;
}

export type LayerDocument = Layer & Document;

export const LayerSchema = SchemaFactory.createForClass(Layer);
LayerSchema.index({ tenantId: 1, order: 1 });
