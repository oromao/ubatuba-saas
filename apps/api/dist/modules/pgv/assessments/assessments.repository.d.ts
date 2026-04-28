import { Model } from 'mongoose';
import { PgvAssessment, PgvAssessmentDocument } from './assessment.schema';
export declare class AssessmentsRepository {
    private readonly model;
    constructor(model: Model<PgvAssessmentDocument>);
    create(data: Partial<PgvAssessment>): Promise<import("mongoose").Document<unknown, {}, PgvAssessmentDocument, {}, {}> & PgvAssessment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertByParcelAndVersion(tenantId: string, projectId: string, parcelId: string, versao: string, data: Partial<PgvAssessment>): Promise<import("mongoose").Document<unknown, {}, PgvAssessmentDocument, {}, {}> & PgvAssessment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByParcel(tenantId: string, projectId: string, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, PgvAssessmentDocument, {}, {}> & PgvAssessment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
