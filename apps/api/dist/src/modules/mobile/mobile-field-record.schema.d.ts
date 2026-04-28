import { Document, Types } from 'mongoose';
export declare class MobileFieldRecord {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    parcelId: Types.ObjectId;
    clientId?: string;
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
    parcelUpdatedAt?: string;
    evidences: Array<{
        clientId: string;
        fileName?: string;
        mimeType?: string;
        base64: string;
        checksum?: string;
        capturedAt?: string;
        size?: number;
        status?: 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
        retries?: number;
        lastError?: string;
        lastAttemptAt?: string;
    }>;
    syncStatus: 'RECEBIDO' | 'PROCESSADO' | 'CONFLITO';
    syncAttempts: number;
    syncedAt?: string;
    syncError?: string;
    syncContext?: {
        clientParcelUpdatedAt?: string;
        serverParcelUpdatedAt?: string;
    };
    syncTimeline: Array<{
        at: string;
        status: 'RECEBIDO' | 'PROCESSADO' | 'CONFLITO' | 'ERRO';
        message: string;
        actorId?: string;
    }>;
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
