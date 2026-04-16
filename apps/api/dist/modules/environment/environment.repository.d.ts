import { Model } from 'mongoose';
import { EnvironmentCase, EnvironmentCaseDocument } from './environment-case.schema';
export declare class EnvironmentRepository {
    private readonly model;
    constructor(model: Model<EnvironmentCaseDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, EnvironmentCaseDocument, {}, {}> & EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, EnvironmentCaseDocument, {}, {}> & EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<EnvironmentCase>): Promise<import("mongoose").Document<unknown, {}, EnvironmentCaseDocument, {}, {}> & EnvironmentCase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(doc: EnvironmentCaseDocument): Promise<EnvironmentCaseDocument>;
}
