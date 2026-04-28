import { Model } from 'mongoose';
import { ImportBatch, ImportBatchDocument } from './import-batch.schema';
export declare class ImportBatchRepository {
    private readonly importBatchModel;
    constructor(importBatchModel: Model<ImportBatchDocument>);
    create(data: Partial<ImportBatch>): Promise<ImportBatchDocument>;
    update(id: string, data: Partial<ImportBatch>): Promise<ImportBatchDocument | null>;
    findById(id: string): Promise<ImportBatchDocument | null>;
    list(tenantId: string, projectId: string, options?: {
        limit?: number;
        skip?: number;
    }): Promise<ImportBatchDocument[]>;
}
