import { Model } from 'mongoose';
import { CitizenCall, CitizenCallDocument } from './citizen-call.schema';
export declare class Citizen156Repository {
    private readonly model;
    constructor(model: Model<CitizenCallDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, CitizenCallDocument, {}, {}> & CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, CitizenCallDocument, {}, {}> & CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<CitizenCall>): Promise<import("mongoose").Document<unknown, {}, CitizenCallDocument, {}, {}> & CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(doc: CitizenCallDocument): Promise<CitizenCallDocument>;
}
