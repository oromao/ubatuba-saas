import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LineGeometry } from '../../../common/utils/geo';

@Schema({ timestamps: true, collection: 'logradouros' })
export class Logradouro {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  nome?: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  tipo?: string;

  @Prop({ required: true })
  code!: string;

  @Prop()
  codigo?: string;

  @Prop({ type: Object })
  geometry?: LineGeometry;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type LogradouroDocument = Logradouro & Document;

export const LogradouroSchema = SchemaFactory.createForClass(Logradouro);
LogradouroSchema.index({ tenantId: 1, projectId: 1, code: 1 }, { unique: true });
