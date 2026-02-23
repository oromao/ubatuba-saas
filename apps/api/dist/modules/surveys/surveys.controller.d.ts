import { CompleteSurveyUploadDto, CreateSurveyDto, RequestSurveyUploadDto, UpdateSurveyDto, UpdateSurveyQaDto } from './dto/surveys.dto';
import { SurveysService } from './surveys.service';
export declare class SurveysController {
    private readonly surveysService;
    constructor(surveysService: SurveysService);
    list(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./survey.schema").SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string): Promise<import("mongoose").Document<unknown, {}, import("./survey.schema").SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateSurveyDto): Promise<import("mongoose").Document<unknown, {}, import("./survey.schema").SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpdateSurveyDto): Promise<import("./survey.schema").SurveyDocument>;
    requestUpload(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string, dto: RequestSurveyUploadDto): Promise<{
        file: {
            surveyId: any;
            category: string;
            fileName: string;
            size: number | undefined;
        };
        method: "PUT";
        url: string;
        headers: {
            'Content-Type': string;
        };
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    completeUpload(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: CompleteSurveyUploadDto): Promise<import("./survey.schema").SurveyDocument>;
    listFiles(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string): Promise<{
        id: string;
        name: string;
        category: string;
        key: string;
        mimeType?: string;
        size?: number;
        uploadedAt: string;
    }[]>;
    getFileDownload(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string, fileId: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    updateQa(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpdateSurveyQaDto): Promise<import("./survey.schema").SurveyDocument>;
    publish(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<import("./survey.schema").SurveyDocument>;
}
