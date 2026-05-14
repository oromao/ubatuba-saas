import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'error_logs' })
export class ErrorLog {
  @Prop({ required: true })
  status!: number;

  @Prop({ required: true })
  method!: string;

  @Prop({ required: true })
  url!: string;

  @Prop()
  detail?: string;

  @Prop()
  trace?: string;

  @Prop()
  errorCode?: string;

  @Prop()
  tenantId?: string;

  @Prop()
  userId?: string;

  @Prop()
  correlationId?: string;

  @Prop({ default: false })
  resolved!: boolean;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: string;
}

export type ErrorLogDocument = ErrorLog & Document;
export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);
ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ status: 1, createdAt: -1 });
ErrorLogSchema.index({ resolved: 1, createdAt: -1 });
