import { Model, Types } from 'mongoose';
import { ComplianceProfile, ComplianceProfileDocument } from './compliance.schema';
export declare class ComplianceRepository {
    private readonly model;
    constructor(model: Model<ComplianceProfileDocument>);
    findOrCreate(tenantId: string, projectId: Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, ComplianceProfileDocument, {}, {}> & ComplianceProfile & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(profile: ComplianceProfileDocument): Promise<ComplianceProfileDocument>;
}
