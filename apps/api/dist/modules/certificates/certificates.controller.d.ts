import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private readonly service;
    constructor(service: CertificatesService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    validatePublic(req: {
        headers: Record<string, string | string[] | undefined>;
    }, code: string, tenantId?: string): Promise<{
        valid: boolean;
        signatureValid: boolean;
        certificate: import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    validatePublicQuery(req: {
        headers: Record<string, string | string[] | undefined>;
    }, code: string, tenantId?: string): Promise<{
        valid: boolean;
        signatureValid: boolean;
        certificate: import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    issue(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateCertificateDto): Promise<{
        validationUrl: string;
        downloadUrl: string;
        tenantId: import("mongoose").Types.ObjectId;
        processId?: import("mongoose").Types.ObjectId;
        type: string;
        subjectName: string;
        subjectDocument?: string;
        validationCode: string;
        hashSha256: string;
        pdfKey: string;
        payloadJson?: string;
        status: "EMITIDA" | "CANCELADA";
        issuedBy?: string;
        issuedAt: string;
        signature?: string;
        signatureAlgorithm?: string;
        signedAt?: string;
        publicKeyHash?: string;
        qrCodeUrl?: string;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
}
