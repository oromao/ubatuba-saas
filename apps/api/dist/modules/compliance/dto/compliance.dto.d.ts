import { ComplianceChecklistStatus } from '../compliance.schema';
export declare class UpsertCompanyDto {
    legalName?: string;
    cnpj?: string;
    mdRegistry?: string;
    mdRegistryValidUntil?: string;
    creaCauNumber?: string;
    creaCauValidUntil?: string;
}
export declare class UpsertResponsibleDto {
    name: string;
    documentId?: string;
    creaCauNumber?: string;
    registryType?: 'CREA' | 'CAU';
    validUntil?: string;
}
export declare class UpsertArtRrtDto {
    type: 'ART' | 'RRT';
    number: string;
    issueDate?: string;
    validUntil?: string;
    responsibleId?: string;
    surveyId?: string;
    projectRef?: string;
    fileKey?: string;
}
export declare class UpsertCatDto {
    number: string;
    issueDate?: string;
    validUntil?: string;
    responsibleId?: string;
    surveyId?: string;
    projectRef?: string;
    fileKey?: string;
}
export declare class UpsertTeamMemberDto {
    name: string;
    role: string;
    skills?: string[];
    assignments?: string[];
    curriculumKey?: string;
    evidenceKeys?: string[];
}
export declare class UpsertChecklistItemDto {
    requirementCode: string;
    title: string;
    status: ComplianceChecklistStatus;
    notes?: string;
    evidenceKeys?: string[];
}
