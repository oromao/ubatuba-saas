import { Document, Types } from 'mongoose';
import { Role } from '../../common/guards/roles.decorator';
export declare class Membership {
    tenantId: Types.ObjectId;
    userId: Types.ObjectId;
    role: Role;
}
export type MembershipDocument = Membership & Document;
export declare const MembershipSchema: import("mongoose").Schema<Membership, import("mongoose").Model<Membership, any, any, any, Document<unknown, any, Membership, any, {}> & Membership & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Membership, Document<unknown, {}, import("mongoose").FlatRecord<Membership>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Membership> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
