import { ParcelsRepository } from '../ctm/parcels/parcels.repository';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CreateLetterTemplateDto, GenerateLetterBatchDto, PreviewTemplateDto, UpdateLetterStatusDto, UpdateLetterTemplateDto } from './dto/letters.dto';
import { LetterBatchDocument } from './letter-batch.schema';
import { NotificationsLettersRepository } from './notifications-letters.repository';
export declare class NotificationsLettersService {
    private readonly repository;
    private readonly projectsService;
    private readonly parcelsRepository;
    private readonly objectStorageService;
    constructor(repository: NotificationsLettersRepository, projectsService: ProjectsService, parcelsRepository: ParcelsRepository, objectStorageService: ObjectStorageService);
    private resolveProject;
    private buildVariablesFromParcel;
    private updateBatchStatus;
    listTemplates(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createTemplate(tenantId: string, dto: CreateLetterTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateTemplate(tenantId: string, projectId: string | undefined, templateId: string, dto: UpdateLetterTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./letter-template.schema").LetterTemplateDocument, {}, {}> & import("./letter-template.schema").LetterTemplate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    previewTemplate(dto: PreviewTemplateDto): {
        renderedHtml: string;
    };
    generateBatch(tenantId: string, dto: GenerateLetterBatchDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listBatches(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findBatchById(tenantId: string, projectId: string | undefined, batchId: string): Promise<import("mongoose").Document<unknown, {}, LetterBatchDocument, {}, {}> & import("./letter-batch.schema").LetterBatch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateLetterStatus(tenantId: string, projectId: string | undefined, batchId: string, letterId: string, dto: UpdateLetterStatusDto): Promise<LetterBatchDocument>;
    getLetterDownloadUrl(tenantId: string, projectId: string | undefined, batchId: string, letterId: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
}
