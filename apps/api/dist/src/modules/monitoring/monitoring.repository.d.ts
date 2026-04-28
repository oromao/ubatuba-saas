import { Model } from 'mongoose';
import { EnvironmentalEvent, EnvironmentalEventDocument } from './environment-event.schema';
export declare class MonitoringRepository {
    private readonly model;
    constructor(model: Model<EnvironmentalEventDocument>);
    list(tenantId: string, filters?: {
        stage?: string;
        severity?: string;
        type?: string;
        sourceMode?: string;
        assignedTo?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalEventDocument, {}, {}> & EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalEventDocument, {}, {}> & EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<EnvironmentalEvent>): Promise<import("mongoose").Document<unknown, {}, EnvironmentalEventDocument, {}, {}> & EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, data: Partial<EnvironmentalEvent>): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalEventDocument, {}, {}> & EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
