import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailOutbox {
  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  body!: string;
}

export type EmailOutboxDocument = EmailOutbox & Document;

export const EmailOutboxSchema = SchemaFactory.createForClass(EmailOutbox);
