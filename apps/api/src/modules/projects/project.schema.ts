import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'projects' })
export class Project {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ type: [Number] })
  defaultCenter?: [number, number];

  @Prop({ type: [Number] })
  defaultBbox?: [number, number, number, number];

  @Prop()
  defaultZoom?: number;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
