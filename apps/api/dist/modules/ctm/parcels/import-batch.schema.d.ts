import { Document, Types } from 'mongoose';
export type ImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
export declare class ImportBatch {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    sourceType: string;
    fileName?: string;
    fileSize?: number;
    status: ImportStatus;
    totalRecords: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    errors: Array<{
        row?: number;
        featureId?: string;
        message: string;
        field?: string;
    }>;
    warnings: string[];
    importedBy?: Types.ObjectId;
    completedAt?: Date;
}
export type ImportBatchDocument = ImportBatch & Document;
export declare const ImportBatchSchema: import("mongoose").Schema<ImportBatch, import("mongoose").Model<ImportBatch, any, any, any, Document<unknown, any, ImportBatch, any, {}> & ImportBatch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ImportBatch, Document<unknown, {}, import("mongoose").FlatRecord<ImportBatch>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ImportBatch> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
