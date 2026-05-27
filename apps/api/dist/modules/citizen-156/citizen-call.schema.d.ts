import { Document, Types } from 'mongoose';
export type CitizenCallStatus = 'ABERTO' | 'EM_TRIAGEM' | 'ENCAMINHADO' | 'EM_CAMPO' | 'RESOLVIDO' | 'CANCELADO';
export declare class CitizenCall {
    tenantId: Types.ObjectId;
    projectId?: Types.ObjectId;
    protocolNumber: string;
    title: string;
    category: string;
    status: CitizenCallStatus;
    reporterName?: string;
    reporterContact?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    attachmentKeys: string[];
    processId?: string;
    alertId?: string;
    history: Array<{
        id: string;
        status: CitizenCallStatus;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
    lgpdConsentAt?: Date;
    lgpdConsentVersion?: string;
    lgpdAnonymized: boolean;
    lgpdAnonymizedAt?: Date;
    lgpdAnonymizedBy?: string;
    lgpdConsentId?: string;
}
export type CitizenCallDocument = CitizenCall & Document;
export declare const CitizenCallSchema: import("mongoose").Schema<CitizenCall, import("mongoose").Model<CitizenCall, any, any, any, Document<unknown, any, CitizenCall, any, {}> & CitizenCall & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CitizenCall, Document<unknown, {}, import("mongoose").FlatRecord<CitizenCall>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<CitizenCall> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
