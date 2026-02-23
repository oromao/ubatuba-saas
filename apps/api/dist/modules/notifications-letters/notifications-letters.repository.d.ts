import { Model } from 'mongoose';
import { LetterBatch, LetterBatchDocument } from './letter-batch.schema';
import { LetterTemplate, LetterTemplateDocument } from './letter-template.schema';
export declare class NotificationsLettersRepository {
    private readonly templateModel;
    private readonly batchModel;
    constructor(templateModel: Model<LetterTemplateDocument>, batchModel: Model<LetterBatchDocument>);
    listTemplates(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, LetterTemplateDocument, {}, {}> & LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findTemplateById(tenantId: string, projectId: string, templateId: string): Promise<(import("mongoose").Document<unknown, {}, LetterTemplateDocument, {}, {}> & LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getNextTemplateVersion(tenantId: string, projectId: string, name: string): Promise<number>;
    createTemplate(data: Partial<LetterTemplate>): Promise<import("mongoose").Document<unknown, {}, LetterTemplateDocument, {}, {}> & LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateTemplate(tenantId: string, projectId: string, templateId: string, data: Partial<LetterTemplate>): Promise<(import("mongoose").Document<unknown, {}, LetterTemplateDocument, {}, {}> & LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createBatch(data: Partial<LetterBatch>): Promise<import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listBatches(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findBatchById(tenantId: string, projectId: string, batchId: string): Promise<(import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    saveBatch(batch: LetterBatchDocument): Promise<LetterBatchDocument>;
}
