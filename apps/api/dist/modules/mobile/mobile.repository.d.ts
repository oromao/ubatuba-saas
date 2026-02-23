import { Model } from 'mongoose';
import { MobileFieldRecord, MobileFieldRecordDocument } from './mobile-field-record.schema';
export declare class MobileRepository {
    private readonly model;
    constructor(model: Model<MobileFieldRecordDocument>);
    create(data: Partial<MobileFieldRecord>): Promise<import("mongoose").Document<unknown, {}, MobileFieldRecordDocument, {}, {}> & MobileFieldRecord & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    list(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, MobileFieldRecordDocument, {}, {}> & MobileFieldRecord & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
