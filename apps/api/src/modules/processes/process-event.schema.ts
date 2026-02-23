import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProcessEvent {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  processId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  message?: string;
}

export type ProcessEventDocument = ProcessEvent & Document;

export const ProcessEventSchema = SchemaFactory.createForClass(ProcessEvent);
