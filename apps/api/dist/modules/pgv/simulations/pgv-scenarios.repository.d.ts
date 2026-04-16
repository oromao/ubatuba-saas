import { Model } from 'mongoose';
import { PgvScenario, PgvScenarioDocument } from './pgv-scenario.schema';
export declare class PgvScenariosRepository {
    private readonly model;
    constructor(model: Model<PgvScenarioDocument>);
    create(data: Partial<PgvScenario>): Promise<import("mongoose").Document<unknown, {}, PgvScenarioDocument, {}, {}> & PgvScenario & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, PgvScenarioDocument, {}, {}> & PgvScenario & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
