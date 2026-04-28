import { Document, Types } from 'mongoose';
export type PublicWorkStatus = 'PLANEJADA' | 'CONTRATADA' | 'EM_EXECUCAO' | 'PARALISADA' | 'CONCLUIDA' | 'CANCELADA';
export type PublicWorkStage = 'CADASTRO' | 'PROJETO' | 'EXECUCAO' | 'FISCALIZACAO' | 'MEDICAO' | 'ENTREGA';
export declare class PublicWork {
    tenantId: Types.ObjectId;
    projectId?: Types.ObjectId;
    protocolNumber: string;
    title: string;
    department: string;
    location: string;
    contractor?: string;
    status: PublicWorkStatus;
    stage: PublicWorkStage;
    progress: number;
    budget?: number;
    startDate?: string;
    endDate?: string;
    evidenceKeys: string[];
    measurements: Array<{
        id: string;
        label: string;
        quantity: number;
        unit: string;
        createdAt: string;
        actorId?: string;
    }>;
    history: Array<{
        id: string;
        status: PublicWorkStatus;
        stage: PublicWorkStage;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
}
export type PublicWorkDocument = PublicWork & Document;
export declare const PublicWorkSchema: import("mongoose").Schema<PublicWork, import("mongoose").Model<PublicWork, any, any, any, Document<unknown, any, PublicWork, any, {}> & PublicWork & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PublicWork, Document<unknown, {}, import("mongoose").FlatRecord<PublicWork>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PublicWork> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
