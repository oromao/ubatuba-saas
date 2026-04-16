import { Document, Types } from 'mongoose';
export type EnvironmentCaseStatus = 'ABERTO' | 'EM_ANALISE' | 'EM_CAMPO' | 'EVIDENCIA' | 'LAUDO' | 'OS' | 'ENCERRADO' | 'INDEFERIDO';
export declare class EnvironmentCase {
    tenantId: Types.ObjectId;
    projectId?: Types.ObjectId;
    protocolNumber: string;
    title: string;
    category: 'APP' | 'PODA' | 'ARVORE' | 'LAUDO' | 'OS' | 'LICENCA';
    status: EnvironmentCaseStatus;
    history: Array<{
        id: string;
        status: EnvironmentCaseStatus;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
    evidenceKeys: string[];
    tasks: Array<{
        id: string;
        title: string;
        status: 'ABERTA' | 'ATENDIDA';
        createdAt: string;
    }>;
    reportPdfKey?: string;
}
export type EnvironmentCaseDocument = EnvironmentCase & Document;
export declare const EnvironmentCaseSchema: import("mongoose").Schema<EnvironmentCase, import("mongoose").Model<EnvironmentCase, any, any, any, Document<unknown, any, EnvironmentCase, any, {}> & EnvironmentCase & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnvironmentCase, Document<unknown, {}, import("mongoose").FlatRecord<EnvironmentCase>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<EnvironmentCase> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
