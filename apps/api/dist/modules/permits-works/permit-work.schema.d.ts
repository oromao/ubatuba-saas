import { Document, Types } from 'mongoose';
export type PermitWorkStatus = 'ABERTO' | 'EM_ANALISE' | 'EXIGENCIA' | 'EM_TAXA' | 'EM_ASSINATURA' | 'EMISSO' | 'CONCLUIDO' | 'INDEFERIDO';
export type PermitWorkStage = 'ABERTURA' | 'ANALISE_TECNICA' | 'EXIGENCIAS' | 'PARECER' | 'TAXAS' | 'ASSINATURA' | 'EMISSAO' | 'ENCERRAMENTO' | 'INDEFERIDO';
export declare class PermitWorkRequest {
    tenantId: Types.ObjectId;
    projectId?: Types.ObjectId;
    protocolNumber: string;
    applicantName: string;
    subjectAddress: string;
    status: PermitWorkStatus;
    currentStage: PermitWorkStage;
    responsibleDepartment?: string;
    history: Array<{
        id: string;
        status: PermitWorkStatus;
        stage?: PermitWorkStage;
        action?: string;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
    requirements: Array<{
        id: string;
        title: string;
        status: 'ABERTA' | 'ATENDIDA';
        notes?: string;
        responsibleDepartment?: string;
        reviewedBy?: string;
        createdAt: string;
        updatedAt?: string;
    }>;
    evidences: Array<{
        id: string;
        title: string;
        note?: string;
        fileName?: string;
        createdAt: string;
        createdBy?: string;
    }>;
    invoices: Array<{
        id: string;
        description: string;
        amount: number;
        status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
        createdAt: string;
    }>;
    decisionPdfKey?: string;
    decision?: {
        kind: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
        reason?: string;
        at: string;
        actorId?: string;
    };
}
export type PermitWorkRequestDocument = PermitWorkRequest & Document;
export declare const PermitWorkRequestSchema: import("mongoose").Schema<PermitWorkRequest, import("mongoose").Model<PermitWorkRequest, any, any, any, Document<unknown, any, PermitWorkRequest, any, {}> & PermitWorkRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PermitWorkRequest, Document<unknown, {}, import("mongoose").FlatRecord<PermitWorkRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PermitWorkRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
