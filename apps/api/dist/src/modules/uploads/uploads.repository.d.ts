import { Model } from 'mongoose';
import { Upload, UploadDocument } from './upload.schema';
export declare class UploadsRepository {
    private readonly model;
    constructor(model: Model<UploadDocument>);
    create(data: Partial<Upload>): Promise<import("mongoose").Document<unknown, {}, UploadDocument, {}, {}> & Upload & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
