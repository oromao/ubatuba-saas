import { Document, Types } from 'mongoose';
export type SurveyType = 'AEROFOTO_RGB_5CM' | 'MOBILE_LIDAR_360';
export type SurveyPipelineStatus = 'RECEBIDO' | 'VALIDANDO' | 'PUBLICADO' | 'REPROVADO';
export declare class Survey {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    type: SurveyType;
    pipelineStatus: SurveyPipelineStatus;
    metadata: {
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
    };
    files: Array<{
        id: string;
        name: string;
        category: string;
        key: string;
        mimeType?: string;
        size?: number;
        uploadedAt: string;
    }>;
    qa: {
        coverageOk?: boolean;
        georeferencingOk?: boolean;
        qualityOk?: boolean;
        comments?: string;
        checkedBy?: string;
        checkedAt?: string;
    };
    publication?: {
        workspace: string;
        layerName: string;
        store: string;
        publishedAt: string;
    };
    auditLog: Array<{
        id: string;
        actorId?: string;
        action: string;
        timestamp: string;
        details?: Record<string, unknown>;
    }>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type SurveyDocument = Survey & Document;
export declare const SurveySchema: import("mongoose").Schema<Survey, import("mongoose").Model<Survey, any, any, any, Document<unknown, any, Survey, any, {}> & Survey & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Survey, Document<unknown, {}, import("mongoose").FlatRecord<Survey>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Survey> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
