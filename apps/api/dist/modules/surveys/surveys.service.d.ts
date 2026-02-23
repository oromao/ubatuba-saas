import { Model } from 'mongoose';
import { LayerDocument } from '../layers/layer.schema';
import { ProjectsService } from '../projects/projects.service';
import { GeoserverPublisherService } from '../shared/geoserver-publisher.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CompleteSurveyUploadDto, CreateSurveyDto, RequestSurveyUploadDto, UpdateSurveyDto, UpdateSurveyQaDto } from './dto/surveys.dto';
import { SurveyDocument } from './survey.schema';
import { SurveysRepository } from './surveys.repository';
export declare class SurveysService {
    private readonly repository;
    private readonly projectsService;
    private readonly objectStorageService;
    private readonly geoserverPublisher;
    private readonly layerModel;
    constructor(repository: SurveysRepository, projectsService: ProjectsService, objectStorageService: ObjectStorageService, geoserverPublisher: GeoserverPublisherService, layerModel: Model<LayerDocument>);
    private sanitizeName;
    private appendAudit;
    private resolveProject;
    private ensureCreateConstraints;
    list(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, surveyId: string): Promise<import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(tenantId: string, dto: CreateSurveyDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & import("./survey.schema").Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, surveyId: string, dto: UpdateSurveyDto, actorId?: string): Promise<SurveyDocument>;
    requestUpload(tenantId: string, projectId: string | undefined, surveyId: string, dto: RequestSurveyUploadDto): Promise<{
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
    completeUpload(tenantId: string, projectId: string | undefined, surveyId: string, dto: CompleteSurveyUploadDto, actorId?: string): Promise<SurveyDocument>;
    listFiles(tenantId: string, projectId: string | undefined, surveyId: string): Promise<{
        id: string;
        name: string;
        category: string;
        key: string;
        mimeType?: string;
        size?: number;
        uploadedAt: string;
    }[]>;
    getFileDownload(tenantId: string, projectId: string | undefined, surveyId: string, fileId: string): Promise<{
        method: "GET";
        url: string;
        key: string;
        bucket: string;
        expiresIn: number;
    }>;
    updateQa(tenantId: string, projectId: string | undefined, surveyId: string, dto: UpdateSurveyQaDto, actorId?: string): Promise<SurveyDocument>;
    publish(tenantId: string, projectId: string | undefined, surveyId: string, actorId?: string): Promise<SurveyDocument>;
}
