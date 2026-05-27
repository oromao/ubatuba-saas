import { Document } from 'mongoose';
export declare class ErrorLog {
    status: number;
    method: string;
    url: string;
    detail?: string;
    trace?: string;
    errorCode?: string;
    tenantId?: string;
    userId?: string;
    correlationId?: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export type ErrorLogDocument = ErrorLog & Document;
export declare const ErrorLogSchema: import("mongoose").Schema<ErrorLog, import("mongoose").Model<ErrorLog, any, any, any, Document<unknown, any, ErrorLog, any, {}> & ErrorLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ErrorLog, Document<unknown, {}, import("mongoose").FlatRecord<ErrorLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ErrorLog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
