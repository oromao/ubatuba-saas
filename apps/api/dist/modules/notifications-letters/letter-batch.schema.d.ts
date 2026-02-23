import { Document, Types } from 'mongoose';
export declare class LetterBatch {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    templateId: Types.ObjectId;
    templateName: string;
    templateVersion: number;
    protocol: string;
    status: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
    filter: {
        parcelWorkflowStatus?: string;
        parcelStatus?: string;
    };
    letters: Array<{
        id: string;
        parcelId: string;
        sqlu?: string;
        address?: string;
        status: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
        fileKey: string;
        generatedAt: string;
        deliveredAt?: string;
        returnedAt?: string;
    }>;
    createdBy?: Types.ObjectId;
}
export type LetterBatchDocument = LetterBatch & Document;
export declare const LetterBatchSchema: import("mongoose").Schema<LetterBatch, import("mongoose").Model<LetterBatch, any, any, any, Document<unknown, any, LetterBatch, any, {}> & LetterBatch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LetterBatch, Document<unknown, {}, import("mongoose").FlatRecord<LetterBatch>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LetterBatch> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
