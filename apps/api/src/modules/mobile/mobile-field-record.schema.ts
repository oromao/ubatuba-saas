import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'mobile_field_records' })
export class MobileFieldRecord {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  parcelId!: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  checklist!: {
    occupancyChecked?: boolean;
    addressChecked?: boolean;
    infrastructureChecked?: boolean;
    notes?: string;
  };

  @Prop({ type: Object })
  location?: {
    lat: number;
    lng: number;
  };

  @Prop()
  photoBase64?: string;

  @Prop({ default: 'RECEBIDO' })
  syncStatus!: 'RECEBIDO' | 'PROCESSADO';

  @Prop({ type: Types.ObjectId })
  syncedBy?: Types.ObjectId;
}

export type MobileFieldRecordDocument = MobileFieldRecord & Document;

export const MobileFieldRecordSchema = SchemaFactory.createForClass(MobileFieldRecord);
MobileFieldRecordSchema.index({ tenantId: 1, projectId: 1, parcelId: 1, createdAt: -1 });

