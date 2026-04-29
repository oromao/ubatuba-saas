import { Document, Types } from 'mongoose';
export type TaxConnectorMode = 'REST_JSON' | 'CSV_UPLOAD' | 'SFTP';
export declare class TaxConnector {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    name: string;
    mode: TaxConnectorMode;
    config: Record<string, unknown>;
    fieldMapping: Record<string, string>;
    isActive: boolean;
    lastSyncAt?: Date;
    createdBy?: Types.ObjectId;
}
export type TaxConnectorDocument = TaxConnector & Document;
export declare const TaxConnectorSchema: import("mongoose").Schema<TaxConnector, import("mongoose").Model<TaxConnector, any, any, any, Document<unknown, any, TaxConnector, any, {}> & TaxConnector & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TaxConnector, Document<unknown, {}, import("mongoose").FlatRecord<TaxConnector>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TaxConnector> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
