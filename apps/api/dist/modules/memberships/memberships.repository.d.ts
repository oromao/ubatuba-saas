import { Model } from 'mongoose';
import { Membership, MembershipDocument } from './membership.schema';
export declare class MembershipsRepository {
    private readonly model;
    constructor(model: Model<MembershipDocument>);
    findByUserAndTenant(userId: string, tenantId: string): Promise<(import("mongoose").Document<unknown, {}, MembershipDocument, {}, {}> & Membership & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Membership>): Promise<import("mongoose").Document<unknown, {}, MembershipDocument, {}, {}> & Membership & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
