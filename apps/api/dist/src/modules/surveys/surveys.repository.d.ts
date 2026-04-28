import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './survey.schema';
export declare class SurveysRepository {
    private readonly model;
    constructor(model: Model<SurveyDocument>);
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, surveyId: string): Promise<(import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Survey>): Promise<import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, surveyId: string, data: Partial<Survey>): Promise<(import("mongoose").Document<unknown, {}, SurveyDocument, {}, {}> & Survey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    save(doc: SurveyDocument): Promise<SurveyDocument>;
}
