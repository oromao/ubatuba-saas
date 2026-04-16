import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class DashboardWidgetConfig {
  @Prop({ required: true })
  id!: string;

  @Prop({ default: true })
  visible!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

@Schema({ timestamps: true, collection: 'dashboard_layouts' })
export class DashboardLayout {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: 'executive' })
  viewMode!: 'executive' | 'operational';

  @Prop({ type: [DashboardWidgetConfig], default: [] })
  widgets!: DashboardWidgetConfig[];
}

export type DashboardLayoutDocument = DashboardLayout & Document;
export const DashboardLayoutSchema = SchemaFactory.createForClass(DashboardLayout);
DashboardLayoutSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
