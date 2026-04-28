import { DeleteResult, Model } from 'mongoose';
import { PublicWork, PublicWorkDocument } from './public-work.schema';
export declare class PublicWorksRepository {
    private readonly model;
    constructor(model: Model<PublicWorkDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, PublicWorkDocument, {}, {}> & PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PublicWorkDocument, {}, {}> & PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PublicWork>): Promise<import("mongoose").Document<unknown, {}, PublicWorkDocument, {}, {}> & PublicWork & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(work: PublicWorkDocument): Promise<PublicWorkDocument>;
    delete(tenantId: string, id: string): Promise<DeleteResult>;
}
