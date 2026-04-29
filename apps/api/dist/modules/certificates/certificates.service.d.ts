import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { ProcessesRepository } from '../processes/processes.repository';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificatesRepository } from './certificates.repository';
export declare class CertificatesService {
    private readonly repository;
    private readonly processesRepository;
    private readonly objectStorageService;
    private readonly cacheService;
    constructor(repository: CertificatesRepository, processesRepository: ProcessesRepository, objectStorageService: ObjectStorageService, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    issue(tenantId: string, dto: CreateCertificateDto, issuedBy?: string): Promise<{
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
    validatePublic(tenantId: string, validationCode: string): Promise<{
        valid: boolean;
        certificate: import("mongoose").Document<unknown, {}, import("./certificate.schema").CertificateDocument, {}, {}> & import("./certificate.schema").Certificate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
}
