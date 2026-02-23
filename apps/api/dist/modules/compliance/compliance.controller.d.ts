import { ComplianceService } from './compliance.service';
import { UpsertArtRrtDto, UpsertCatDto, UpsertChecklistItemDto, UpsertCompanyDto, UpsertResponsibleDto, UpsertTeamMemberDto } from './dto/compliance.dto';
export declare class ComplianceController {
    private readonly service;
    constructor(service: ComplianceService);
    getProfile(req: {
        tenantId: string;
    }, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./compliance.schema").ComplianceProfileDocument, {}, {}> & import("./compliance.schema").ComplianceProfile & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertCompany(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertCompanyDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addResponsible(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertResponsibleDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateResponsible(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpsertResponsibleDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteResponsible(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addArtRrt(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertArtRrtDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateArtRrt(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpsertArtRrtDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteArtRrt(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addCat(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertCatDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateCat(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpsertCatDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteCat(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addTeamMember(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertTeamMemberDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateTeamMember(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: UpsertTeamMemberDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteTeamMember(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    upsertChecklist(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, dto: UpsertChecklistItemDto): Promise<import("./compliance.schema").ComplianceProfileDocument>;
}
