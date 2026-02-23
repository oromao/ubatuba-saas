import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'parcel_socioeconomic' })
export class ParcelSocioeconomic {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop()
  incomeBracket?: string;

  @Prop()
  faixaRenda?: string;

  @Prop()
  residents?: number;

  @Prop()
  moradores?: number;

  @Prop()
  vulnerabilityIndicator?: string;

  @Prop()
  vulnerabilidade?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ParcelSocioeconomicDocument = ParcelSocioeconomic & Document;

export const ParcelSocioeconomicSchema = SchemaFactory.createForClass(ParcelSocioeconomic);
ParcelSocioeconomicSchema.index({ tenantId: 1, projectId: 1, parcelId: 1 }, { unique: true });
