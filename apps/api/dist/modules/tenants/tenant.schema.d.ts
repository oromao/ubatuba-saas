import { Document } from 'mongoose';
export declare class Tenant {
    name: string;
    slug: string;
}
export type TenantDocument = Tenant & Document;
export declare const TenantSchema: import("mongoose").Schema<Tenant, import("mongoose").Model<Tenant, any, any, any, Document<unknown, any, Tenant, any, {}> & Tenant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tenant, Document<unknown, {}, import("mongoose").FlatRecord<Tenant>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Tenant> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
