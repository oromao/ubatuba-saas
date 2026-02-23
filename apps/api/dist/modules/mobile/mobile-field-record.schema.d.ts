import { Document, Types } from 'mongoose';
export declare class MobileFieldRecord {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    checklist: {
        occupancyChecked?: boolean;
        addressChecked?: boolean;
        infrastructureChecked?: boolean;
        notes?: string;
    };
    location?: {
        lat: number;
        lng: number;
    };
    photoBase64?: string;
    syncStatus: 'RECEBIDO' | 'PROCESSADO';
    syncedBy?: Types.ObjectId;
}
export type MobileFieldRecordDocument = MobileFieldRecord & Document;
export declare const MobileFieldRecordSchema: import("mongoose").Schema<MobileFieldRecord, import("mongoose").Model<MobileFieldRecord, any, any, any, Document<unknown, any, MobileFieldRecord, any, {}> & MobileFieldRecord & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MobileFieldRecord, Document<unknown, {}, import("mongoose").FlatRecord<MobileFieldRecord>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<MobileFieldRecord> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
