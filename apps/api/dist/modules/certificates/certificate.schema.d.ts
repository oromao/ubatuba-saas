import { Document, Types } from 'mongoose';
export declare class Certificate {
    tenantId: Types.ObjectId;
    processId?: Types.ObjectId;
    type: string;
    subjectName: string;
    subjectDocument?: string;
    validationCode: string;
    hashSha256: string;
    pdfKey: string;
    payloadJson?: string;
    status: 'EMITIDA' | 'CANCELADA';
    issuedBy?: string;
    issuedAt: string;
    signature?: string;
    signatureAlgorithm?: string;
    signedAt?: string;
    publicKeyHash?: string;
    qrCodeUrl?: string;
}
export type CertificateDocument = Certificate & Document;
export declare const CertificateSchema: import("mongoose").Schema<Certificate, import("mongoose").Model<Certificate, any, any, any, Document<unknown, any, Certificate, any, {}> & Certificate & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Certificate, Document<unknown, {}, import("mongoose").FlatRecord<Certificate>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Certificate> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
