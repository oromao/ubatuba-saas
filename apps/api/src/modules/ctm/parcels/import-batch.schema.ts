import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

@Schema({ timestamps: true, collection: 'import_batches' })
export class ImportBatch {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  sourceType!: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  status!: ImportStatus;

  @Prop()
  totalRecords!: number;

  @Prop()
  successCount!: number;

  @Prop()
  errorCount!: number;

  @Prop()
  warningCount!: number;

  @Prop({ type: [Object], default: [] })
  errors!: Array<{ row?: number; featureId?: string; message: string; field?: string }>;

  @Prop({ type: [String], default: [] })
  warnings!: string[];

  @Prop({ type: Types.ObjectId })
  importedBy?: Types.ObjectId;

  @Prop()
  completedAt?: Date;
}

export type ImportBatchDocument = ImportBatch & Document;

export const ImportBatchSchema = SchemaFactory.createForClass(ImportBatch);
ImportBatchSchema.index({ tenantId: 1, projectId: 1, status: 1 });
ImportBatchSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });
