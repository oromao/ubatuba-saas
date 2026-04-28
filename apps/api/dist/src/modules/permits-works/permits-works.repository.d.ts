import { Model } from 'mongoose';
import { PermitWorkRequest, PermitWorkRequestDocument } from './permit-work.schema';
export declare class PermitsWorksRepository {
    private readonly model;
    constructor(model: Model<PermitWorkRequestDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PermitWorkRequest>): Promise<import("mongoose").Document<unknown, {}, PermitWorkRequestDocument, {}, {}> & PermitWorkRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(request: PermitWorkRequestDocument): Promise<PermitWorkRequestDocument>;
}
