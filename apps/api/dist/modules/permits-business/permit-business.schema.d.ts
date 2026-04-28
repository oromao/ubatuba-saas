import { Document, Types } from 'mongoose';
export type PermitBusinessStatus = 'ABERTO' | 'EM_ANALISE' | 'EXIGENCIA' | 'EM_TAXA' | 'EMITIDO' | 'ENCERRADO' | 'INDEFERIDO';
export type PermitBusinessStage = 'ABERTURA' | 'ANALISE_TECNICA' | 'EXIGENCIAS' | 'PARECER' | 'TAXAS' | 'ASSINATURA' | 'EMISSAO' | 'ENCERRAMENTO' | 'INDEFERIDO';
export declare class PermitBusinessRequest {
    tenantId: Types.ObjectId;
    projectId?: Types.ObjectId;
    protocolNumber: string;
    companyName: string;
    cnpj: string;
    activityDescription: string;
    status: PermitBusinessStatus;
    currentStage: PermitBusinessStage;
    responsibleDepartment?: string;
    history: Array<{
        id: string;
        status: PermitBusinessStatus;
        stage?: PermitBusinessStage;
        action?: string;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
    taxes: Array<{
        id: string;
        description: string;
        amount: number;
        status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
        createdAt: string;
    }>;
    evidences: Array<{
        id: string;
        title: string;
        note?: string;
        fileName?: string;
        createdAt: string;
        createdBy?: string;
    }>;
    permitPdfKey?: string;
    decision?: {
        kind: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO';
        reason?: string;
        at: string;
        actorId?: string;
    };
}
export type PermitBusinessRequestDocument = PermitBusinessRequest & Document;
export declare const PermitBusinessRequestSchema: import("mongoose").Schema<PermitBusinessRequest, import("mongoose").Model<PermitBusinessRequest, any, any, any, Document<unknown, any, PermitBusinessRequest, any, {}> & PermitBusinessRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PermitBusinessRequest, Document<unknown, {}, import("mongoose").FlatRecord<PermitBusinessRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PermitBusinessRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
