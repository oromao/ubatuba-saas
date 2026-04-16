import { Model } from 'mongoose';
import { PermitBusinessRequest, PermitBusinessRequestDocument } from './permit-business.schema';
export declare class PermitsBusinessRepository {
    private readonly model;
    constructor(model: Model<PermitBusinessRequestDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, PermitBusinessRequestDocument, {}, {}> & PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, PermitBusinessRequestDocument, {}, {}> & PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<PermitBusinessRequest>): Promise<import("mongoose").Document<unknown, {}, PermitBusinessRequestDocument, {}, {}> & PermitBusinessRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(doc: PermitBusinessRequestDocument): Promise<PermitBusinessRequestDocument>;
}
