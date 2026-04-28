import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './certificate.schema';
export declare class CertificatesRepository {
    private readonly model;
    constructor(model: Model<CertificateDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, CertificateDocument, {}, {}> & Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, CertificateDocument, {}, {}> & Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByValidationCode(tenantId: string, validationCode: string): Promise<(import("mongoose").Document<unknown, {}, CertificateDocument, {}, {}> & Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<Certificate>): Promise<import("mongoose").Document<unknown, {}, CertificateDocument, {}, {}> & Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
