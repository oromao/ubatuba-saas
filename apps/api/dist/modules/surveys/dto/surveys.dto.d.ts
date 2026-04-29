import { SurveyPipelineStatus, SurveyType } from '../survey.schema';
export declare class CreateSurveyDto {
    name: string;
    type: SurveyType;
    projectId?: string;
    municipality: string;
    surveyDate: string;
    gsdCm?: number;
    srcDatum: string;
    precision?: string;
    supplier: string;
    technicalResponsibleId?: string;
    observations?: string;
    bbox?: [number, number, number, number];
    areaGeometry?: Record<string, unknown>;
}
export declare class UpdateSurveyDto {
    name?: string;
    pipelineStatus?: SurveyPipelineStatus;
    municipality?: string;
    surveyDate?: string;
    gsdCm?: number;
    srcDatum?: string;
    precision?: string;
    supplier?: string;
    technicalResponsibleId?: string;
    observations?: string;
}
export declare class RequestSurveyUploadDto {
    fileName: string;
    mimeType?: string;
    size?: number;
    category: string;
}
export declare class CompleteSurveyUploadDto {
    key: string;
    name: string;
    category: string;
    mimeType?: string;
    size?: number;
}
export declare class UpdateSurveyQaDto {
    coverageOk?: boolean;
    georeferencingOk?: boolean;
    qualityOk?: boolean;
    comments?: string;
}
