import { CreateLetterTemplateDto, GenerateLetterBatchDto, PreviewTemplateDto, UpdateLetterStatusDto, UpdateLetterTemplateDto } from './dto/letters.dto';
import { NotificationsLettersService } from './notifications-letters.service';
export declare class NotificationsLettersController {
    private readonly service;
    constructor(service: NotificationsLettersService);
    listTemplates(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createTemplate(req: {
        tenantId: string;
    }, dto: CreateLetterTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateTemplate(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string, dto: UpdateLetterTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    previewTemplate(dto: PreviewTemplateDto): {
        renderedHtml: string;
    };
    generateBatch(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: GenerateLetterBatchDto): Promise<import("mongoose").Document<unknown, {}, import("./letter-batch.schema").LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listBatches(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./letter-batch.schema").LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getBatch(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string): Promise<import("mongoose").Document<unknown, {}, import("./letter-batch.schema").LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateLetterStatus(req: {
        tenantId: string;
    }, projectId: string | undefined, batchId: string, letterId: string, dto: UpdateLetterStatusDto): Promise<import("./letter-batch.schema").LetterBatchDocument>;
    getDownloadUrl(req: {
        tenantId: string;
    }, projectId: string | undefined, batchId: string, letterId: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
}
