import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProjectsService } from '../projects/projects.service';
import { ComplianceRepository } from './compliance.repository';
import {
  UpsertArtRrtDto,
  UpsertCatDto,
  UpsertChecklistItemDto,
  UpsertCompanyDto,
  UpsertResponsibleDto,
  UpsertTeamMemberDto,
} from './dto/compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly repository: ComplianceRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  private async resolve(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findOrCreate(tenantId, resolvedProjectId);
  }

  private appendAuditLog(
    profile: {
      auditLog: Array<{
        id: string;
        actorId?: string;
        action: string;
        section: string;
        referenceId?: string;
        timestamp: string;
        details?: Record<string, unknown>;
      }>;
    },
    params: {
      actorId?: string;
      action: string;
      section: string;
      referenceId?: string;
      details?: Record<string, unknown>;
    },
  ) {
    profile.auditLog.push({
      id: randomUUID(),
      actorId: params.actorId,
      action: params.action,
      section: params.section,
      referenceId: params.referenceId,
      timestamp: new Date().toISOString(),
      details: params.details,
    });
  }

  async getProfile(tenantId: string, projectId?: string) {
    return this.resolve(tenantId, projectId);
  }

  async upsertCompany(tenantId: string, projectId: string | undefined, dto: UpsertCompanyDto, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    profile.company = {
      ...(profile.company ?? {}),
      ...dto,
    };
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPSERT_COMPANY',
      section: 'company',
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(profile);
  }

  async addResponsible(tenantId: string, projectId: string | undefined, dto: UpsertResponsibleDto, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    const item = {
      id: randomUUID(),
      name: dto.name,
      documentId: dto.documentId,
      creaCauNumber: dto.creaCauNumber,
      registryType: dto.registryType,
      validUntil: dto.validUntil,
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    profile.technicalResponsibles.push(item);
    this.appendAuditLog(profile, {
      actorId,
      action: 'ADD_RESPONSIBLE',
      section: 'technicalResponsibles',
      referenceId: item.id,
      details: { name: item.name },
    });
    return this.repository.save(profile);
  }

  async updateResponsible(
    tenantId: string,
    projectId: string | undefined,
    itemId: string,
    dto: UpsertResponsibleDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const index = profile.technicalResponsibles.findIndex((item) => item.id === itemId);
    if (index < 0) throw new BadRequestException('Responsavel nao encontrado');
    profile.technicalResponsibles[index] = {
      ...profile.technicalResponsibles[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPDATE_RESPONSIBLE',
      section: 'technicalResponsibles',
      referenceId: itemId,
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(profile);
  }

  async deleteResponsible(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    profile.technicalResponsibles = profile.technicalResponsibles.filter((item) => item.id !== itemId);
    this.appendAuditLog(profile, {
      actorId,
      action: 'DELETE_RESPONSIBLE',
      section: 'technicalResponsibles',
      referenceId: itemId,
    });
    return this.repository.save(profile);
  }

  async addArtRrt(tenantId: string, projectId: string | undefined, dto: UpsertArtRrtDto, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    const item = {
      id: randomUUID(),
      type: dto.type,
      number: dto.number,
      issueDate: dto.issueDate,
      validUntil: dto.validUntil,
      responsibleId: dto.responsibleId,
      surveyId: dto.surveyId,
      projectRef: dto.projectRef,
      fileKey: dto.fileKey,
      createdAt: new Date().toISOString(),
    };
    profile.artsRrts.push(item);
    this.appendAuditLog(profile, {
      actorId,
      action: 'ADD_ART_RRT',
      section: 'artsRrts',
      referenceId: item.id,
      details: { number: item.number, type: item.type },
    });
    return this.repository.save(profile);
  }

  async updateArtRrt(
    tenantId: string,
    projectId: string | undefined,
    itemId: string,
    dto: UpsertArtRrtDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const index = profile.artsRrts.findIndex((item) => item.id === itemId);
    if (index < 0) throw new BadRequestException('ART/RRT nao encontrado');
    profile.artsRrts[index] = {
      ...profile.artsRrts[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPDATE_ART_RRT',
      section: 'artsRrts',
      referenceId: itemId,
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(profile);
  }

  async deleteArtRrt(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    profile.artsRrts = profile.artsRrts.filter((item) => item.id !== itemId);
    this.appendAuditLog(profile, {
      actorId,
      action: 'DELETE_ART_RRT',
      section: 'artsRrts',
      referenceId: itemId,
    });
    return this.repository.save(profile);
  }

  async addCat(tenantId: string, projectId: string | undefined, dto: UpsertCatDto, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    const item = {
      id: randomUUID(),
      number: dto.number,
      issueDate: dto.issueDate,
      validUntil: dto.validUntil,
      responsibleId: dto.responsibleId,
      surveyId: dto.surveyId,
      projectRef: dto.projectRef,
      fileKey: dto.fileKey,
      createdAt: new Date().toISOString(),
    };
    profile.cats.push(item);
    this.appendAuditLog(profile, {
      actorId,
      action: 'ADD_CAT',
      section: 'cats',
      referenceId: item.id,
      details: { number: item.number },
    });
    return this.repository.save(profile);
  }

  async updateCat(
    tenantId: string,
    projectId: string | undefined,
    itemId: string,
    dto: UpsertCatDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const index = profile.cats.findIndex((item) => item.id === itemId);
    if (index < 0) throw new BadRequestException('CAT nao encontrada');
    profile.cats[index] = {
      ...profile.cats[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPDATE_CAT',
      section: 'cats',
      referenceId: itemId,
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(profile);
  }

  async deleteCat(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    profile.cats = profile.cats.filter((item) => item.id !== itemId);
    this.appendAuditLog(profile, {
      actorId,
      action: 'DELETE_CAT',
      section: 'cats',
      referenceId: itemId,
    });
    return this.repository.save(profile);
  }

  async addTeamMember(
    tenantId: string,
    projectId: string | undefined,
    dto: UpsertTeamMemberDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const item = {
      id: randomUUID(),
      name: dto.name,
      role: dto.role,
      skills: dto.skills ?? [],
      assignments: dto.assignments ?? [],
      curriculumKey: dto.curriculumKey,
      evidenceKeys: dto.evidenceKeys ?? [],
      createdAt: new Date().toISOString(),
    };
    profile.team.push(item);
    this.appendAuditLog(profile, {
      actorId,
      action: 'ADD_TEAM_MEMBER',
      section: 'team',
      referenceId: item.id,
      details: { name: item.name, role: item.role },
    });
    return this.repository.save(profile);
  }

  async updateTeamMember(
    tenantId: string,
    projectId: string | undefined,
    itemId: string,
    dto: UpsertTeamMemberDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const index = profile.team.findIndex((item) => item.id === itemId);
    if (index < 0) throw new BadRequestException('Membro da equipe nao encontrado');
    profile.team[index] = {
      ...profile.team[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPDATE_TEAM_MEMBER',
      section: 'team',
      referenceId: itemId,
      details: { fields: Object.keys(dto) },
    });
    return this.repository.save(profile);
  }

  async deleteTeamMember(tenantId: string, projectId: string | undefined, itemId: string, actorId?: string) {
    const profile = await this.resolve(tenantId, projectId);
    profile.team = profile.team.filter((item) => item.id !== itemId);
    this.appendAuditLog(profile, {
      actorId,
      action: 'DELETE_TEAM_MEMBER',
      section: 'team',
      referenceId: itemId,
    });
    return this.repository.save(profile);
  }

  async upsertChecklistItem(
    tenantId: string,
    projectId: string | undefined,
    dto: UpsertChecklistItemDto,
    actorId?: string,
  ) {
    const profile = await this.resolve(tenantId, projectId);
    const existingIndex = profile.checklist.findIndex((item) => item.requirementCode === dto.requirementCode);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      profile.checklist[existingIndex] = {
        ...profile.checklist[existingIndex],
        ...dto,
        updatedAt: now,
        updatedBy: actorId,
      };
    } else {
      profile.checklist.push({
        id: randomUUID(),
        requirementCode: dto.requirementCode,
        title: dto.title,
        status: dto.status,
        notes: dto.notes,
        evidenceKeys: dto.evidenceKeys ?? [],
        updatedAt: now,
        updatedBy: actorId,
      });
    }
    this.appendAuditLog(profile, {
      actorId,
      action: 'UPSERT_CHECKLIST_ITEM',
      section: 'checklist',
      referenceId: dto.requirementCode,
      details: { status: dto.status },
    });
    return this.repository.save(profile);
  }
}
