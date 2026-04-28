import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './tenant.schema';
export declare class TenantsRepository {
    private readonly model;
    constructor(model: Model<TenantDocument>);
    create(data: Partial<Tenant>): Promise<import("mongoose").Document<unknown, {}, TenantDocument, {}, {}> & Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, TenantDocument, {}, {}> & Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findBySlug(slug: string): Promise<(import("mongoose").Document<unknown, {}, TenantDocument, {}, {}> & Tenant & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
