import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuthEvent {
  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  type!: string;

  @Prop()
  detail?: string;
}

export type AuthEventDocument = AuthEvent & Document;

export const AuthEventSchema = SchemaFactory.createForClass(AuthEvent);
