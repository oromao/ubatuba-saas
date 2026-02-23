import { Model } from 'mongoose';
import { EnvironmentalAlert, EnvironmentalAlertDocument } from './alert.schema';
export declare class AlertsRepository {
    private readonly model;
    constructor(model: Model<EnvironmentalAlertDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalAlertDocument, {}, {}> & EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalAlertDocument, {}, {}> & EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<EnvironmentalAlert>): Promise<import("mongoose").Document<unknown, {}, EnvironmentalAlertDocument, {}, {}> & EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, data: Partial<EnvironmentalAlert>): Promise<(import("mongoose").Document<unknown, {}, EnvironmentalAlertDocument, {}, {}> & EnvironmentalAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, id: string): Promise<import("mongodb").DeleteResult>;
}
