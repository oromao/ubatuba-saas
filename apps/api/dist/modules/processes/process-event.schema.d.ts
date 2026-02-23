import { Document, Types } from 'mongoose';
export declare class ProcessEvent {
    tenantId: Types.ObjectId;
    processId: string;
    type: string;
    message?: string;
}
export type ProcessEventDocument = ProcessEvent & Document;
export declare const ProcessEventSchema: import("mongoose").Schema<ProcessEvent, import("mongoose").Model<ProcessEvent, any, any, any, Document<unknown, any, ProcessEvent, any, {}> & ProcessEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProcessEvent, Document<unknown, {}, import("mongoose").FlatRecord<ProcessEvent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ProcessEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
