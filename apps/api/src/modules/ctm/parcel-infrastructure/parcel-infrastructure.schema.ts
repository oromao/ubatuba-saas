import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'parcel_infrastructure' })
export class ParcelInfrastructure {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop()
  water?: boolean;

  @Prop()
  agua?: boolean;

  @Prop()
  sewage?: boolean;

  @Prop()
  esgoto?: boolean;

  @Prop()
  electricity?: boolean;

  @Prop()
  energia?: boolean;

  @Prop()
  pavingType?: string;

  @Prop()
  pavimentacao?: string;

  @Prop()
  publicLighting?: boolean;

  @Prop()
  iluminacao?: boolean;

  @Prop()
  garbageCollection?: boolean;

  @Prop()
  coleta?: boolean;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ParcelInfrastructureDocument = ParcelInfrastructure & Document;

export const ParcelInfrastructureSchema = SchemaFactory.createForClass(ParcelInfrastructure);
ParcelInfrastructureSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
