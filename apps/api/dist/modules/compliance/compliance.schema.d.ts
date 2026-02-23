import { Document, Types } from 'mongoose';
export type ComplianceChecklistStatus = 'OK' | 'PENDENTE' | 'EXPIRADO';
export declare class ComplianceProfile {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    company?: {
        legalName?: string;
        cnpj?: string;
        mdRegistry?: string;
        mdRegistryValidUntil?: string;
        creaCauNumber?: string;
        creaCauValidUntil?: string;
        attachments?: Array<{
            name: string;
            key: string;
            uploadedAt?: string;
        }>;
    };
    technicalResponsibles: Array<{
        id: string;
        name: string;
        documentId?: string;
        creaCauNumber?: string;
        registryType?: 'CREA' | 'CAU';
        validUntil?: string;
        attachments?: Array<{
            name: string;
            key: string;
            uploadedAt?: string;
        }>;
        createdAt: string;
        updatedAt?: string;
    }>;
    artsRrts: Array<{
        id: string;
        type: 'ART' | 'RRT';
        number: string;
        issueDate?: string;
        validUntil?: string;
        responsibleId?: string;
        surveyId?: string;
        projectRef?: string;
        fileKey?: string;
        createdAt: string;
        updatedAt?: string;
    }>;
    cats: Array<{
        id: string;
        number: string;
        issueDate?: string;
        validUntil?: string;
        responsibleId?: string;
        surveyId?: string;
        projectRef?: string;
        fileKey?: string;
        createdAt: string;
        updatedAt?: string;
    }>;
    team: Array<{
        id: string;
        name: string;
        role: string;
        skills?: string[];
        assignments?: string[];
        curriculumKey?: string;
        evidenceKeys?: string[];
        createdAt: string;
        updatedAt?: string;
    }>;
    checklist: Array<{
        id: string;
        requirementCode: string;
        title: string;
        status: ComplianceChecklistStatus;
        notes?: string;
        evidenceKeys?: string[];
        updatedAt: string;
        updatedBy?: string;
    }>;
    auditLog: Array<{
        id: string;
        actorId?: string;
        action: string;
        section: string;
        referenceId?: string;
        timestamp: string;
        details?: Record<string, unknown>;
    }>;
}
export type ComplianceProfileDocument = ComplianceProfile & Document;
export declare const ComplianceProfileSchema: import("mongoose").Schema<ComplianceProfile, import("mongoose").Model<ComplianceProfile, any, any, any, Document<unknown, any, ComplianceProfile, any, {}> & ComplianceProfile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ComplianceProfile, Document<unknown, {}, import("mongoose").FlatRecord<ComplianceProfile>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ComplianceProfile> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
