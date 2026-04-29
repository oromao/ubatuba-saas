import { Document, Types } from 'mongoose';
export declare class AuthEvent {
    userId: Types.ObjectId;
    type: string;
    detail?: string;
}
export type AuthEventDocument = AuthEvent & Document;
export declare const AuthEventSchema: import("mongoose").Schema<AuthEvent, import("mongoose").Model<AuthEvent, any, any, any, Document<unknown, any, AuthEvent, any, {}> & AuthEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuthEvent, Document<unknown, {}, import("mongoose").FlatRecord<AuthEvent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AuthEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
