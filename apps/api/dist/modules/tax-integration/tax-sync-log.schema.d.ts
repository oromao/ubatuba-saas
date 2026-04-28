import { Document, Types } from 'mongoose';
export declare class TaxSyncLog {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    connectorId: Types.ObjectId;
    status: 'SUCESSO' | 'ERRO';
    trigger: 'MANUAL' | 'TEST';
    summary: {
        processed: number;
        inserted?: number;
        updated?: number;
        errors?: number;
        message?: string;
    };
    errorMessage?: string;
    startedBy?: Types.ObjectId;
}
export type TaxSyncLogDocument = TaxSyncLog & Document;
export declare const TaxSyncLogSchema: import("mongoose").Schema<TaxSyncLog, import("mongoose").Model<TaxSyncLog, any, any, any, Document<unknown, any, TaxSyncLog, any, {}> & TaxSyncLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TaxSyncLog, Document<unknown, {}, import("mongoose").FlatRecord<TaxSyncLog>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TaxSyncLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
