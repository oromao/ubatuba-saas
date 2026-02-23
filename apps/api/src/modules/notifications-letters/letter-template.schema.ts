import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'letter_templates' })
export class LetterTemplate {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  version!: number;

  @Prop({ required: true })
  html!: string;

  @Prop({ type: [String], default: [] })
  variables!: string[];

  @Prop({ default: true })
  isActive!: boolean;
}

export type LetterTemplateDocument = LetterTemplate & Document;

export const LetterTemplateSchema = SchemaFactory.createForClass(LetterTemplate);
LetterTemplateSchema.index({ tenantId: 1, projectId: 1, name: 1, version: 1 }, { unique: true });

