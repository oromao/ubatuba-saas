import { Document } from 'mongoose';
export declare class EmailOutbox {
    to: string;
    subject: string;
    body: string;
}
export type EmailOutboxDocument = EmailOutbox & Document;
export declare const EmailOutboxSchema: import("mongoose").Schema<EmailOutbox, import("mongoose").Model<EmailOutbox, any, any, any, Document<unknown, any, EmailOutbox, any, {}> & EmailOutbox & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmailOutbox, Document<unknown, {}, import("mongoose").FlatRecord<EmailOutbox>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<EmailOutbox> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
