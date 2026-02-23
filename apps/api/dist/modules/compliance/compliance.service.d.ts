import { ProjectsService } from '../projects/projects.service';
import { ComplianceRepository } from './compliance.repository';
import { UpsertArtRrtDto, UpsertCatDto, UpsertChecklistItemDto, UpsertCompanyDto, UpsertResponsibleDto, UpsertTeamMemberDto } from './dto/compliance.dto';
export declare class ComplianceService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: ComplianceRepository, projectsService: ProjectsService);
    private resolve;
    private appendAuditLog;
    getProfile(tenantId: string, projectId?: string): Promise<import("mongoose").Document<unknown, {}, import("./compliance.schema").ComplianceProfileDocument, {}, {}> & import("./compliance.schema").ComplianceProfile & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    upsertCompany(tenantId: string, projectId: string | undefined, dto: UpsertCompanyDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addResponsible(tenantId: string, projectId: string | undefined, dto: UpsertResponsibleDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateResponsible(tenantId: string, projectId: string | undefined, itemId: string, dto: UpsertResponsibleDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteResponsible(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addArtRrt(tenantId: string, projectId: string | undefined, dto: UpsertArtRrtDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateArtRrt(tenantId: string, projectId: string | undefined, itemId: string, dto: UpsertArtRrtDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteArtRrt(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addCat(tenantId: string, projectId: string | undefined, dto: UpsertCatDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateCat(tenantId: string, projectId: string | undefined, itemId: string, dto: UpsertCatDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteCat(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    addTeamMember(tenantId: string, projectId: string | undefined, dto: UpsertTeamMemberDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    updateTeamMember(tenantId: string, projectId: string | undefined, itemId: string, dto: UpsertTeamMemberDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    deleteTeamMember(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
    upsertChecklistItem(tenantId: string, projectId: string | undefined, dto: UpsertChecklistItemDto, actorId?: string): Promise<import("./compliance.schema").ComplianceProfileDocument>;
}
