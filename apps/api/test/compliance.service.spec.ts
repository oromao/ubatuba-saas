import { ComplianceService } from '../src/modules/compliance/compliance.service';
import { ComplianceRepository } from '../src/modules/compliance/compliance.repository';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

let mockProfile: any;

const mockRepository = {
  findOrCreate: jest.fn().mockImplementation((tenantId, projectId) => {
    if (!mockProfile) {
      mockProfile = {
        tenantId,
        projectId,
        technicalResponsibles: [],
        artsRrts: [],
        cats: [],
        team: [],
        checklist: [],
        auditLog: [],
      };
    }
    return Promise.resolve(mockProfile);
  }),
  save: jest.fn().mockImplementation((profile) => {
    mockProfile = profile;
    return Promise.resolve(profile);
  }),
} as unknown as ComplianceRepository;

const mockProjectsService = {
  resolveProjectId: jest.fn().mockImplementation((tenantId, projectId) => {
    return Promise.resolve(projectId ? new Types.ObjectId(projectId) : new Types.ObjectId());
  }),
} as unknown as ProjectsService;

describe('ComplianceService', () => {
  let service: ComplianceService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfile = null; // Reset shared profile between tests
    service = new ComplianceService(mockRepository, mockProjectsService);
  });

  it('should get compliance profile', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();

    const profile = await service.getProfile(tenantId, projectId);

    expect(mockProjectsService.resolveProjectId).toHaveBeenCalledWith(tenantId, projectId);
    expect(mockRepository.findOrCreate).toHaveBeenCalled();
    expect(profile).toBeDefined();
  });

  it('should upsert company info and log audit log', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      legalName: 'Empresa Teste',
      cnpj: '12.345.678/0001-99',
    };

    const updated = await service.upsertCompany(tenantId, projectId, dto, 'actor-1');

    expect(updated.company?.legalName).toBe('Empresa Teste');
    expect(updated.auditLog).toHaveLength(1);
    expect(updated.auditLog[0].action).toBe('UPSERT_COMPANY');
  });

  it('should add, update, and delete technical responsibles', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      name: 'Engenheiro Teste',
      documentId: '123.456.789-00',
      creaCauNumber: 'CREA-SP 123456',
      registryType: 'CREA' as const,
      validUntil: '2027-12-31',
    };

    let profile = await service.addResponsible(tenantId, projectId, dto, 'actor-1');
    expect(profile.technicalResponsibles).toHaveLength(1);
    expect(profile.technicalResponsibles[0].name).toBe('Engenheiro Teste');
    expect(profile.auditLog[0].action).toBe('ADD_RESPONSIBLE');

    const respId = profile.technicalResponsibles[0].id;
    const updateDto = { ...dto, name: 'Engenheiro Atualizado' };
    profile = await service.updateResponsible(tenantId, projectId, respId, updateDto, 'actor-1');
    expect(profile.technicalResponsibles[0].name).toBe('Engenheiro Atualizado');
    expect(profile.auditLog[1].action).toBe('UPDATE_RESPONSIBLE');

    // Test error case for invalid responsible id
    await expect(service.updateResponsible(tenantId, projectId, 'invalid-id', updateDto, 'actor-1')).rejects.toThrow(
      BadRequestException,
    );

    profile = await service.deleteResponsible(tenantId, projectId, respId, 'actor-1');
    expect(profile.technicalResponsibles).toHaveLength(0);
    expect(profile.auditLog[2].action).toBe('DELETE_RESPONSIBLE');
  });

  it('should add, update, and delete ART/RRT', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      type: 'ART' as const,
      number: '123456',
      issueDate: '2026-01-01',
      validUntil: '2027-01-01',
      responsibleId: 'resp-1',
    };

    let profile = await service.addArtRrt(tenantId, projectId, dto, 'actor-1');
    expect(profile.artsRrts).toHaveLength(1);
    expect(profile.artsRrts[0].number).toBe('123456');
    expect(profile.auditLog[0].action).toBe('ADD_ART_RRT');

    const artId = profile.artsRrts[0].id;
    const updateDto = { ...dto, number: '654321' };
    profile = await service.updateArtRrt(tenantId, projectId, artId, updateDto, 'actor-1');
    expect(profile.artsRrts[0].number).toBe('654321');
    expect(profile.auditLog[1].action).toBe('UPDATE_ART_RRT');

    // Test error case
    await expect(service.updateArtRrt(tenantId, projectId, 'invalid-id', updateDto, 'actor-1')).rejects.toThrow(
      BadRequestException,
    );

    profile = await service.deleteArtRrt(tenantId, projectId, artId, 'actor-1');
    expect(profile.artsRrts).toHaveLength(0);
    expect(profile.auditLog[2].action).toBe('DELETE_ART_RRT');
  });

  it('should add, update, and delete CAT', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      number: 'CAT-123',
      issueDate: '2026-01-01',
      validUntil: '2027-01-01',
      responsibleId: 'resp-1',
    };

    let profile = await service.addCat(tenantId, projectId, dto, 'actor-1');
    expect(profile.cats).toHaveLength(1);
    expect(profile.cats[0].number).toBe('CAT-123');
    expect(profile.auditLog[0].action).toBe('ADD_CAT');

    const catId = profile.cats[0].id;
    const updateDto = { ...dto, number: 'CAT-321' };
    profile = await service.updateCat(tenantId, projectId, catId, updateDto, 'actor-1');
    expect(profile.cats[0].number).toBe('CAT-321');
    expect(profile.auditLog[1].action).toBe('UPDATE_CAT');

    // Test error case
    await expect(service.updateCat(tenantId, projectId, 'invalid-id', updateDto, 'actor-1')).rejects.toThrow(
      BadRequestException,
    );

    profile = await service.deleteCat(tenantId, projectId, catId, 'actor-1');
    expect(profile.cats).toHaveLength(0);
    expect(profile.auditLog[2].action).toBe('DELETE_CAT');
  });

  it('should add, update, and delete team members', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      name: 'João Silva',
      role: 'Engenheiro Civil',
      skills: ['Autocad', 'GIS'],
      assignments: ['Atividade 1'],
    };

    let profile = await service.addTeamMember(tenantId, projectId, dto, 'actor-1');
    expect(profile.team).toHaveLength(1);
    expect(profile.team[0].name).toBe('João Silva');
    expect(profile.auditLog[0].action).toBe('ADD_TEAM_MEMBER');

    const memberId = profile.team[0].id;
    const updateDto = { ...dto, name: 'João Silva Jr' };
    profile = await service.updateTeamMember(tenantId, projectId, memberId, updateDto, 'actor-1');
    expect(profile.team[0].name).toBe('João Silva Jr');
    expect(profile.auditLog[1].action).toBe('UPDATE_TEAM_MEMBER');

    // Test error case
    await expect(service.updateTeamMember(tenantId, projectId, 'invalid-id', updateDto, 'actor-1')).rejects.toThrow(
      BadRequestException,
    );

    profile = await service.deleteTeamMember(tenantId, projectId, memberId, 'actor-1');
    expect(profile.team).toHaveLength(0);
    expect(profile.auditLog[2].action).toBe('DELETE_TEAM_MEMBER');
  });

  it('should upsert checklist items', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const dto = {
      requirementCode: 'REQ-01',
      title: 'Levantamento topográfico',
      status: 'OK' as const,
      notes: 'OK',
    };

    let profile = await service.upsertChecklistItem(tenantId, projectId, dto, 'actor-1');
    expect(profile.checklist).toHaveLength(1);
    expect(profile.checklist[0].requirementCode).toBe('REQ-01');
    expect(profile.checklist[0].status).toBe('OK');
    expect(profile.auditLog[0].action).toBe('UPSERT_CHECKLIST_ITEM');

    const updateDto = { ...dto, status: 'PENDENTE' as const };
    profile = await service.upsertChecklistItem(tenantId, projectId, updateDto, 'actor-1');
    expect(profile.checklist).toHaveLength(1);
    expect(profile.checklist[0].status).toBe('PENDENTE');
  });

  it('should fetch audit logs and checklist', async () => {
    const tenantId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();

    const logs = await service.getAuditLogs(tenantId, projectId);
    const checklist = await service.getChecklist(tenantId, projectId);

    expect(logs).toBeDefined();
    expect(checklist).toBeDefined();
  });
});
