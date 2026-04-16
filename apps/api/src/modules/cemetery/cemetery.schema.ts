import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CemeteryPlotStatus = 'LIVRE' | 'RESERVADO' | 'OCUPADO' | 'EM_MANUTENCAO';

@Schema({ timestamps: true, collection: 'cemetery_plots' })
export class CemeteryPlot {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  cemeteryName!: string;

  @Prop({ required: true })
  block!: string;

  @Prop({ required: true })
  row!: string;

  @Prop({ required: true })
  plot!: string;

  @Prop({ required: true, default: 'LIVRE' })
  status!: CemeteryPlotStatus;

  @Prop()
  ownerName?: string;

  @Prop()
  occupantName?: string;

  @Prop()
  locationCode?: string;

  @Prop({ type: [String], default: [] })
  documentKeys!: string[];

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: CemeteryPlotStatus;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;
}

export type CemeteryPlotDocument = CemeteryPlot & Document;

export const CemeteryPlotSchema = SchemaFactory.createForClass(CemeteryPlot);
CemeteryPlotSchema.index({ tenantId: 1, cemeteryName: 1, block: 1, row: 1, plot: 1 }, { unique: true });
