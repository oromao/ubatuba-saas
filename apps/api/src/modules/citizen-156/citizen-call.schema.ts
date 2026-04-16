import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CitizenCallStatus = 'ABERTO' | 'EM_TRIAGEM' | 'ENCAMINHADO' | 'EM_CAMPO' | 'RESOLVIDO' | 'CANCELADO';

@Schema({ timestamps: true, collection: 'citizen_calls' })
export class CitizenCall {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  protocolNumber!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true, default: 'ABERTO' })
  status!: CitizenCallStatus;

  @Prop()
  reporterName?: string;

  @Prop()
  reporterContact?: string;

  @Prop({ type: Object })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Prop({ type: [String], default: [] })
  attachmentKeys!: string[];

  @Prop()
  processId?: string;

  @Prop()
  alertId?: string;

  @Prop({ type: [Object], default: [] })
  history!: Array<{
    id: string;
    status: CitizenCallStatus;
    message: string;
    createdAt: string;
    actorId?: string;
  }>;
}

export type CitizenCallDocument = CitizenCall & Document;

export const CitizenCallSchema = SchemaFactory.createForClass(CitizenCall);
CitizenCallSchema.index({ tenantId: 1, protocolNumber: 1 }, { unique: true });
CitizenCallSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
