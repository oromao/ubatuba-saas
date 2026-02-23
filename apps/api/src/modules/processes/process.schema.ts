import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Process {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  owner!: string;

  @Prop({ required: true, default: 'EM_ANALISE' })
  status!: string;
}

export type ProcessDocument = Process & Document;

export const ProcessSchema = SchemaFactory.createForClass(Process);
