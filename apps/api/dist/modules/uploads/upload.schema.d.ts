import { Document, Types } from 'mongoose';
export type UploadStatus = 'MOCKED' | 'UPLOADED' | 'PUBLISHED';
export declare class Upload {
    tenantId: Types.ObjectId;
    key: string;
    filename: string;
    status: UploadStatus;
    size?: number;
    mimeType?: string;
}
export type UploadDocument = Upload & Document;
export declare const UploadSchema: import("mongoose").Schema<Upload, import("mongoose").Model<Upload, any, any, any, Document<unknown, any, Upload, any, {}> & Upload & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Upload, Document<unknown, {}, import("mongoose").FlatRecord<Upload>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Upload> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
