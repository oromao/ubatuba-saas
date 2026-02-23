"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const projects_service_1 = require("../projects/projects.service");
const compliance_repository_1 = require("./compliance.repository");
let ComplianceService = class ComplianceService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async resolve(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.findOrCreate(tenantId, resolvedProjectId);
    }
    appendAuditLog(profile, params) {
        profile.auditLog.push({
            id: (0, crypto_1.randomUUID)(),
            actorId: params.actorId,
            action: params.action,
            section: params.section,
            referenceId: params.referenceId,
            timestamp: new Date().toISOString(),
            details: params.details,
        });
    }
    async getProfile(tenantId, projectId) {
        return this.resolve(tenantId, projectId);
    }
    async upsertCompany(tenantId, projectId, dto, actorId) {
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
    async addResponsible(tenantId, projectId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const item = {
            id: (0, crypto_1.randomUUID)(),
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
    async updateResponsible(tenantId, projectId, itemId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const index = profile.technicalResponsibles.findIndex((item) => item.id === itemId);
        if (index < 0)
            throw new common_1.BadRequestException('Responsavel nao encontrado');
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
    async deleteResponsible(tenantId, projectId, itemId, actorId) {
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
    async addArtRrt(tenantId, projectId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const item = {
            id: (0, crypto_1.randomUUID)(),
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
    async updateArtRrt(tenantId, projectId, itemId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const index = profile.artsRrts.findIndex((item) => item.id === itemId);
        if (index < 0)
            throw new common_1.BadRequestException('ART/RRT nao encontrado');
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
    async deleteArtRrt(tenantId, projectId, itemId, actorId) {
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
    async addCat(tenantId, projectId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const item = {
            id: (0, crypto_1.randomUUID)(),
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
    async updateCat(tenantId, projectId, itemId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const index = profile.cats.findIndex((item) => item.id === itemId);
        if (index < 0)
            throw new common_1.BadRequestException('CAT nao encontrada');
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
    async deleteCat(tenantId, projectId, itemId, actorId) {
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
    async addTeamMember(tenantId, projectId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const item = {
            id: (0, crypto_1.randomUUID)(),
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
    async updateTeamMember(tenantId, projectId, itemId, dto, actorId) {
        const profile = await this.resolve(tenantId, projectId);
        const index = profile.team.findIndex((item) => item.id === itemId);
        if (index < 0)
            throw new common_1.BadRequestException('Membro da equipe nao encontrado');
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
    async deleteTeamMember(tenantId, projectId, itemId, actorId) {
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
    async upsertChecklistItem(tenantId, projectId, dto, actorId) {
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
        }
        else {
            profile.checklist.push({
                id: (0, crypto_1.randomUUID)(),
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
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [compliance_repository_1.ComplianceRepository,
        projects_service_1.ProjectsService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map