import { Model } from 'mongoose';
import { Process, ProcessDocument } from './process.schema';
import { ProcessEvent, ProcessEventDocument } from './process-event.schema';
export declare class ProcessesRepository {
    private readonly model;
    private readonly eventModel;
    constructor(model: Model<ProcessDocument>, eventModel: Model<ProcessEventDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, ProcessDocument, {}, {}> & Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, ProcessDocument, {}, {}> & Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Process>): Promise<import("mongoose").Document<unknown, {}, ProcessDocument, {}, {}> & Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, data: Partial<Process>): Promise<(import("mongoose").Document<unknown, {}, ProcessDocument, {}, {}> & Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, id: string): Promise<import("mongodb").DeleteResult>;
    addEvent(data: Partial<ProcessEvent>): Promise<import("mongoose").Document<unknown, {}, ProcessEventDocument, {}, {}> & ProcessEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listEvents(tenantId: string, processId: string): Promise<(import("mongoose").Document<unknown, {}, ProcessEventDocument, {}, {}> & ProcessEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
