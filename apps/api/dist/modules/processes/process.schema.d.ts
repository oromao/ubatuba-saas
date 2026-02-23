import { Document, Types } from 'mongoose';
export declare class Process {
    tenantId: Types.ObjectId;
    protocolNumber: string;
    title: string;
    owner: string;
    status: string;
}
export type ProcessDocument = Process & Document;
export declare const ProcessSchema: import("mongoose").Schema<Process, import("mongoose").Model<Process, any, any, any, Document<unknown, any, Process, any, {}> & Process & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Process, Document<unknown, {}, import("mongoose").FlatRecord<Process>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Process> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
