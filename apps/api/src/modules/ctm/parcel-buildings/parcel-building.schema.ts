import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'parcel_buildings' })
export class ParcelBuilding {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop()
  useType?: string;

  @Prop()
  constructionStandard?: string;

  @Prop({ default: 0 })
  builtArea?: number;

  @Prop()
  floors?: number;

  @Prop()
  constructionYear?: number;

  @Prop()
  occupancyType?: string;

  @Prop()
  uso?: string;

  @Prop()
  padraoConstrutivo?: string;

  @Prop()
  areaConstruida?: number;

  @Prop()
  pavimentos?: number;

  @Prop()
  anoConstrucao?: number;

  @Prop()
  tipoOcupacao?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ParcelBuildingDocument = ParcelBuilding & Document;

export const ParcelBuildingSchema = SchemaFactory.createForClass(ParcelBuilding);
ParcelBuildingSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
