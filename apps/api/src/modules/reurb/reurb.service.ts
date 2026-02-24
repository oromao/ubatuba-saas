import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Types } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import {
  CompleteDocumentUploadDto,
  CompleteProjectDocumentUploadDto,
  CompleteUnitDocumentUploadDto,
  CreatePendencyDto,
  CreateReurbFamilyDto,
  CreateReurbProjectDto,
  CreateReurbUnitDto,
  RequestDocumentUploadDto,
  RequestProjectDocumentUploadDto,
  RequestUnitDocumentUploadDto,
  ImportFamiliesCsvDto,
  UpdatePendencyStatusDto,
  UpdateReurbFamilyDto,
  UpdateReurbProjectDto,
  UpdateReurbUnitDto,
  UpsertTenantConfigDto,
} from './dto/reurb.dto';
import { ReurbDeliverableKind, ReurbFamily, ReurbProjectStatus, TenantConfig } from './reurb.schema';
import { ReurbRepository } from './reurb.repository';
import {
  DEFAULT_SPREADSHEET_COLUMNS,
  buildCartorioZip,
  sha256Hex,
  SpreadsheetColumn,
  toCsv,
  toXlsx,
} from './reurb.utils';
import { ReurbValidationService, ValidationAction } from './reurb-validation.service';
import { createTransport } from 'nodemailer';

@Injectable()
export class ReurbService {
  private readonly pendencyEvents = new EventEmitter();
  private readonly mailTransport = process.env.SMTP_URL
    ? createTransport(process.env.SMTP_URL)
    : null;

  constructor(
    private readonly repository: ReurbRepository,
    private readonly projectsService: ProjectsService,
    private readonly storage: ObjectStorageService,
    private readonly validationService: ReurbValidationService,
  ) {}

  getPendencyEvents() {
    return this.pendencyEvents;
  }

  private sanitizeName(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  private async resolveProjectId(tenantId: string, projectId?: string) {
    const resolved = await this.projectsService.resolveProjectId(tenantId, projectId);
    return String(resolved);
  }

  private async loadConfig(tenantId: string) {
    const config = await this.repository.findTenantConfig(tenantId);
    if (config) return config;
    return this.repository.upsertTenantConfig(tenantId, {
      reurbEnabled: false,
      requiredFamilyFields: ['familyCode', 'nucleus', 'responsibleName', 'status'],
      spreadsheet: {
        templateVersion: 'v1',
        columns: DEFAULT_SPREADSHEET_COLUMNS,
      },
      documentNaming: {
        familyFolder: 'familias',
        spreadsheetFolder: 'planilha',
        titlesFolder: 'titulos',
        approvedDocumentsFolder: 'documentos_aprovados',
        requiredDocumentTypes: [],
        requiredProjectDocumentTypes: [],
        requiredUnitDocumentTypes: [],
      },
      validationRules: {
        blockOnPendingDocumentIssues: true,
        requireAptaStatusForExports: false,
        requireAptaStatusForCartorioPackage: true,
        failOnMissingRequiredFields: true,
      },
    });
  }

  private normalizeColumns(config: TenantConfig): SpreadsheetColumn[] {
    const configured = (config.spreadsheet?.columns ?? []).filter((item) => item.key && item.label);
    return configured.length > 0 ? configured : DEFAULT_SPREADSHEET_COLUMNS;
  }

  private familyRowsForExport(families: ReurbFamily[]) {
    return families.map((family) => ({
      id: String((family as unknown as { id?: string }).id ?? ''),
      familyCode: family.familyCode,
      nucleus: family.nucleus,
      responsibleName: family.responsibleName,
      cpf: family.cpf,
      address: family.address,
      membersCount: family.membersCount,
      monthlyIncome: family.monthlyIncome,
      status: family.status,
      data: family.data ?? {},
    }));
  }

  private async validateAndAudit(params: {
    tenantId: string;
    projectId: string;
    actorId?: string;
    action: ValidationAction;
    purpose?: string;
  }) {
    const [config, families, pendencies] = await Promise.all([
      this.loadConfig(params.tenantId),
      this.repository.listFamilies(params.tenantId, params.projectId),
      this.repository.listPendencies(params.tenantId, params.projectId),
    ]);

    const validation = this.validationService.validateBeforeDeliverable({
      config,
      families,
      pendencies,
      action: params.action,
    });

    await this.repository.createAuditLog({
      tenantId: asObjectId(params.tenantId),
      projectId: asObjectId(params.projectId),
      action: params.action,
      success: validation.ok,
      errors: validation.errors,
      details: {
        families: families.length,
        pendencies: pendencies.length,
        purpose: params.purpose ?? 'not_informed',
      },
      actorId: params.actorId ? asObjectId(params.actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    if (!validation.ok) {
      throw new UnprocessableEntityException({
        code: 'REURB_VALIDATION_FAILED',
        errors: validation.errors,
      });
    }

    return { config, families };
  }

  private async auditAccess(params: {
    tenantId: string;
    projectId: string;
    actorId?: string;
    action: string;
    purpose?: string;
    details?: Record<string, unknown>;
  }) {
    await this.repository.createAuditLog({
      tenantId: asObjectId(params.tenantId),
      projectId: asObjectId(params.projectId),
      action: params.action,
      success: true,
      errors: [],
      details: {
        purpose: params.purpose ?? 'not_informed',
        ...params.details,
      },
      actorId: params.actorId ? asObjectId(params.actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });
  }

  async getTenantConfig(tenantId: string) {
    return this.loadConfig(tenantId);
  }

  async createProject(tenantId: string, dto: CreateReurbProjectDto, actorId?: string) {
    const project = await this.repository.createProject({
      tenantId: asObjectId(tenantId),
      name: dto.name.trim(),
      area: dto.area?.trim(),
      reurbType: dto.reurbType ?? 'REURB-S',
      status: dto.status ?? 'RASCUNHO',
      startDate: dto.startDate,
      endDate: dto.endDate,
      responsibles: dto.responsibles ?? [],
      metadata: dto.metadata ?? {},
      statusHistory: [
        {
          id: randomUUID(),
          nextStatus: dto.status ?? 'RASCUNHO',
          observation: 'Projeto criado',
          actorId: actorId ? asObjectId(actorId) : undefined,
          at: new Date().toISOString(),
        },
      ],
      documents: [],
      createdBy: actorId ? asObjectId(actorId) : undefined,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(project.id),
      action: 'PROJECT_CREATE',
      success: true,
      errors: [],
      details: { name: project.name, status: project.status },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return project;
  }

  async listProjects(tenantId: string) {
    return this.repository.listProjects(tenantId);
  }

  async updateProject(
    tenantId: string,
    projectId: string,
    dto: UpdateReurbProjectDto,
    actorId?: string,
  ) {
    const existing = await this.repository.findProjectById(tenantId, projectId);
    if (!existing) throw new NotFoundException('Projeto nao encontrado');

    const statusHistory =
      dto.status && dto.status !== existing.status
        ? [
            ...(existing.statusHistory ?? []),
            {
              id: randomUUID(),
              previousStatus: existing.status as ReurbProjectStatus,
              nextStatus: dto.status,
              observation: dto.statusObservation,
              actorId: actorId ? asObjectId(actorId) : undefined,
              at: new Date().toISOString(),
            },
          ]
        : existing.statusHistory;

    const updated = await this.repository.updateProject(tenantId, projectId, {
      name: dto.name ?? existing.name,
      area: dto.area ?? existing.area,
      reurbType: dto.reurbType ?? existing.reurbType,
      status: dto.status ?? existing.status,
      startDate: dto.startDate ?? existing.startDate,
      endDate: dto.endDate ?? existing.endDate,
      responsibles: dto.responsibles ?? existing.responsibles,
      metadata: dto.metadata ?? existing.metadata,
      statusHistory,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    if (!updated) throw new NotFoundException('Projeto nao encontrado');

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'PROJECT_UPDATE',
      success: true,
      errors: [],
      details: { status: updated.status },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return updated;
  }

  async upsertTenantConfig(tenantId: string, dto: UpsertTenantConfigDto, actorId?: string) {
    const current = await this.loadConfig(tenantId);
    return this.repository.upsertTenantConfig(tenantId, {
      reurbEnabled: dto.reurbEnabled ?? current.reurbEnabled,
      requiredFamilyFields: dto.requiredFamilyFields ?? current.requiredFamilyFields,
      spreadsheet: {
        templateVersion: dto.spreadsheet?.templateVersion ?? current.spreadsheet?.templateVersion ?? 'v1',
        columns: dto.spreadsheet?.columns ?? current.spreadsheet?.columns ?? DEFAULT_SPREADSHEET_COLUMNS,
      },
      documentNaming: {
        familyFolder: dto.documentNaming?.familyFolder ?? current.documentNaming?.familyFolder ?? 'familias',
        spreadsheetFolder:
          dto.documentNaming?.spreadsheetFolder ?? current.documentNaming?.spreadsheetFolder ?? 'planilha',
        titlesFolder: dto.documentNaming?.titlesFolder ?? current.documentNaming?.titlesFolder ?? 'titulos',
        approvedDocumentsFolder:
          dto.documentNaming?.approvedDocumentsFolder ??
          current.documentNaming?.approvedDocumentsFolder ??
          'documentos_aprovados',
        requiredDocumentTypes:
          dto.documentNaming?.requiredDocumentTypes ?? current.documentNaming?.requiredDocumentTypes ?? [],
        requiredProjectDocumentTypes:
          dto.documentNaming?.requiredProjectDocumentTypes ??
          current.documentNaming?.requiredProjectDocumentTypes ??
          [],
        requiredUnitDocumentTypes:
          dto.documentNaming?.requiredUnitDocumentTypes ?? current.documentNaming?.requiredUnitDocumentTypes ?? [],
      },
      validationRules: {
        blockOnPendingDocumentIssues:
          dto.validationRules?.blockOnPendingDocumentIssues ??
          current.validationRules?.blockOnPendingDocumentIssues ??
          true,
        requireAptaStatusForExports:
          dto.validationRules?.requireAptaStatusForExports ??
          current.validationRules?.requireAptaStatusForExports ??
          false,
        requireAptaStatusForCartorioPackage:
          dto.validationRules?.requireAptaStatusForCartorioPackage ??
          current.validationRules?.requireAptaStatusForCartorioPackage ??
          true,
        failOnMissingRequiredFields:
          dto.validationRules?.failOnMissingRequiredFields ??
          current.validationRules?.failOnMissingRequiredFields ??
          true,
      },
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });
  }

  async createFamily(tenantId: string, dto: CreateReurbFamilyDto, actorId?: string) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    if (!dto.familyCode?.trim()) throw new BadRequestException('familyCode obrigatorio');

    const created = await this.repository.createFamily({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      familyCode: dto.familyCode.trim(),
      nucleus: dto.nucleus.trim(),
      responsibleName: dto.responsibleName.trim(),
      cpf: dto.cpf?.trim(),
      address: dto.address?.trim(),
      membersCount: dto.membersCount ?? 1,
      monthlyIncome: dto.monthlyIncome,
      status: dto.status ?? 'PENDENTE',
      data: dto.data ?? {},
      documents: [],
      createdBy: actorId ? asObjectId(actorId) : undefined,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'FAMILY_CREATE',
      success: true,
      errors: [],
      details: { familyCode: created.familyCode, nucleus: created.nucleus },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return created;
  }

  async importFamiliesCsv(tenantId: string, dto: ImportFamiliesCsvDto, actorId?: string) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const delimiter = dto.delimiter && dto.delimiter.length > 0 ? dto.delimiter : ',';
    const lines = dto.csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) throw new BadRequestException('CSV vazio');

    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          const next = line[i + 1];
          if (next === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }
        if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
          continue;
        }
        current += char;
      }
      result.push(current.trim());
      return result;
    };

    const header = parseLine(lines[0]).map((col) => col.toLowerCase());
    const idx = (name: string) => header.indexOf(name.toLowerCase());
    const required = ['familycode', 'nucleus', 'responsiblename'];
    const missing = required.filter((col) => idx(col) === -1);
    if (missing.length > 0) {
      throw new BadRequestException(`CSV faltando colunas: ${missing.join(', ')}`);
    }

    const errors: Array<{ row: number; message: string; data: string[] }> = [];
    let created = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const row = parseLine(lines[i]);
      const familyCode = row[idx('familycode')] ?? '';
      const nucleus = row[idx('nucleus')] ?? '';
      const responsibleName = row[idx('responsiblename')] ?? '';
      if (!familyCode || !nucleus || !responsibleName) {
        errors.push({ row: i + 1, message: 'Campos obrigatorios faltando', data: row });
        continue;
      }
      try {
        await this.repository.createFamily({
          tenantId: asObjectId(tenantId),
          projectId: asObjectId(projectId),
          familyCode: familyCode.trim(),
          nucleus: nucleus.trim(),
          responsibleName: responsibleName.trim(),
          cpf: row[idx('cpf')]?.trim() || undefined,
          address: row[idx('address')]?.trim() || undefined,
          membersCount: Number(row[idx('memberscount')] ?? 1) || 1,
          monthlyIncome: Number(row[idx('monthlyincome')] ?? 0) || undefined,
          status: (row[idx('status')] as ReurbFamily['status']) ?? 'PENDENTE',
          data: {},
          documents: [],
          createdBy: actorId ? asObjectId(actorId) : undefined,
          updatedBy: actorId ? asObjectId(actorId) : undefined,
        });
        created += 1;
      } catch (error) {
        errors.push({ row: i + 1, message: (error as Error).message, data: row });
      }
    }

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'FAMILY_IMPORT_CSV',
      success: errors.length === 0,
      errors: errors.map((err) => ({ code: 'CSV_ROW_ERROR', message: err.message })),
      details: { created, total: lines.length - 1 },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return { total: lines.length - 1, created, errors };
  }

  async listFamilies(
    tenantId: string,
    projectId?: string,
    filters?: { status?: string; nucleus?: string; q?: string },
    params?: { actorId?: string; purpose?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const families = await this.repository.listFamilies(tenantId, resolved, filters);
    await this.auditAccess({
      tenantId,
      projectId: resolved,
      actorId: params?.actorId,
      purpose: params?.purpose,
      action: 'ACCESS_FAMILIES_LIST',
      details: {
        count: families.length,
        filters: filters ?? {},
      },
    });
    return families;
  }

  async updateFamily(
    tenantId: string,
    familyId: string,
    dto: UpdateReurbFamilyDto,
    projectId?: string,
    actorId?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const updated = await this.repository.updateFamily(tenantId, resolved, familyId, {
      nucleus: dto.nucleus,
      responsibleName: dto.responsibleName,
      cpf: dto.cpf,
      address: dto.address,
      membersCount: dto.membersCount,
      monthlyIncome: dto.monthlyIncome,
      status: dto.status,
      data: dto.data,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });
    if (!updated) throw new NotFoundException('Familia nao encontrada');

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolved),
      action: 'FAMILY_UPDATE',
      success: true,
      errors: [],
      details: { familyCode: updated.familyCode, nucleus: updated.nucleus },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return updated;
  }

  async exportFamiliesCsv(
    tenantId: string,
    projectId: string | undefined,
    actorId?: string,
    purpose?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'EXPORT_BANCO_TABULADO',
      purpose,
    });

    const columns = this.normalizeColumns(config);
    const rows = this.familyRowsForExport(families);
    const csv = toCsv(columns, rows);
    return this.persistDeliverable({
      tenantId,
      projectId: resolved,
      actorId,
      kind: 'BANCO_TABULADO_CSV',
      fileNameBase: 'banco_tabulado_familias',
      extension: 'csv',
      payload: Buffer.from(csv, 'utf-8'),
      metadata: {
        rows: rows.length,
        columns: columns.map((col) => col.key),
      },
    });
  }

  async exportFamiliesXlsx(
    tenantId: string,
    projectId: string | undefined,
    actorId?: string,
    purpose?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'EXPORT_BANCO_TABULADO',
      purpose,
    });

    const columns = this.normalizeColumns(config);
    const rows = this.familyRowsForExport(families);
    const xlsx = await toXlsx(columns, rows);
    return this.persistDeliverable({
      tenantId,
      projectId: resolved,
      actorId,
      kind: 'BANCO_TABULADO_XLSX',
      fileNameBase: 'banco_tabulado_familias',
      extension: 'xlsx',
      payload: xlsx,
      metadata: {
        rows: rows.length,
        columns: columns.map((col) => col.key),
      },
    });
  }

  async generatePlanilhaSintese(
    tenantId: string,
    projectId: string | undefined,
    actorId?: string,
    purpose?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'GENERATE_PLANILHA',
      purpose,
    });

    const columns = this.normalizeColumns(config);
    const rows = this.familyRowsForExport(families);
    const xlsx = await toXlsx(columns, rows);
    return this.persistDeliverable({
      tenantId,
      projectId: resolved,
      actorId,
      kind: 'PLANILHA_SINTESE',
      fileNameBase: 'planilha_sintese',
      extension: 'xlsx',
      payload: xlsx,
      metadata: {
        templateVersion: config.spreadsheet?.templateVersion ?? 'v1',
        rows: rows.length,
        generatedBy: actorId ?? null,
      },
    });
  }

  async createPendency(tenantId: string, dto: CreatePendencyDto, actorId?: string) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);

    if (dto.familyId) {
      const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
      if (!family) throw new NotFoundException('Familia nao encontrada para vincular pendencia');
    }

    const created = await this.repository.createPendency({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      familyId: dto.familyId ? asObjectId(dto.familyId) : undefined,
      nucleus: dto.nucleus,
      documentType: dto.documentType,
      missingDocument: dto.missingDocument,
      dueDate: dto.dueDate,
      status: dto.status ?? 'ABERTA',
      observation: dto.observation,
      responsible: dto.responsible,
      statusHistory: [
        {
          id: randomUUID(),
          nextStatus: dto.status ?? 'ABERTA',
          observation: dto.observation,
          actorId: actorId ? asObjectId(actorId) : undefined,
          at: new Date().toISOString(),
        },
      ],
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    this.pendencyEvents.emit('updated', {
      tenantId,
      projectId,
      pendencyId: String((created as unknown as { id?: string }).id ?? ''),
      action: 'CREATE',
      at: new Date().toISOString(),
    });

    return created;
  }

  async listPendencies(
    tenantId: string,
    projectId?: string,
    filters?: { status?: string; nucleus?: string; familyId?: string },
    params?: { actorId?: string; purpose?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const pendencies = await this.repository.listPendencies(tenantId, resolved, filters);
    await this.auditAccess({
      tenantId,
      projectId: resolved,
      actorId: params?.actorId,
      purpose: params?.purpose,
      action: 'ACCESS_PENDENCIES_LIST',
      details: {
        count: pendencies.length,
        filters: filters ?? {},
      },
    });
    return pendencies;
  }

  async createUnit(tenantId: string, dto: CreateReurbUnitDto, actorId?: string) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const created = await this.repository.createUnit({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      code: dto.code.trim(),
      block: dto.block?.trim(),
      lot: dto.lot?.trim(),
      address: dto.address?.trim(),
      area: dto.area,
      geometry: dto.geometry,
      familyIds: (dto.familyIds ?? []).map(asObjectId),
      metadata: dto.metadata ?? {},
      documents: [],
      createdBy: actorId ? asObjectId(actorId) : undefined,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'UNIT_CREATE',
      success: true,
      errors: [],
      details: { code: created.code },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return created;
  }

  async listUnits(
    tenantId: string,
    projectId?: string,
    filters?: { code?: string; block?: string; lot?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listUnits(tenantId, resolved, filters);
  }

  async updateUnit(
    tenantId: string,
    unitId: string,
    dto: UpdateReurbUnitDto,
    projectId?: string,
    actorId?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const existing = await this.repository.findUnitById(tenantId, resolved, unitId);
    if (!existing) throw new NotFoundException('Unidade nao encontrada');

    const updated = await this.repository.updateUnit(tenantId, resolved, unitId, {
      block: dto.block ?? existing.block,
      lot: dto.lot ?? existing.lot,
      address: dto.address ?? existing.address,
      area: dto.area ?? existing.area,
      geometry: dto.geometry ?? existing.geometry,
      familyIds: dto.familyIds ? dto.familyIds.map(asObjectId) : existing.familyIds,
      metadata: dto.metadata ?? existing.metadata,
      updatedBy: actorId ? asObjectId(actorId) : undefined,
    });

    if (!updated) throw new NotFoundException('Unidade nao encontrada');

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolved),
      action: 'UNIT_UPDATE',
      success: true,
      errors: [],
      details: { code: updated.code },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return updated;
  }

  async updatePendencyStatus(
    tenantId: string,
    pendencyId: string,
    dto: UpdatePendencyStatusDto,
    projectId?: string,
    actorId?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const existing = await this.repository.findPendencyById(tenantId, resolved, pendencyId);
    if (!existing) throw new NotFoundException('Pendencia nao encontrada');

    const updated = await this.repository.updatePendencyStatus(tenantId, resolved, pendencyId, {
      status: dto.status,
      observation: dto.observation,
      actorId: actorId ? asObjectId(actorId) : undefined,
      statusHistoryEntry: {
        id: randomUUID(),
        previousStatus: existing.status,
        nextStatus: dto.status,
        observation: dto.observation,
        actorId: actorId ? asObjectId(actorId) : undefined,
        at: new Date().toISOString(),
      },
    });

    this.pendencyEvents.emit('updated', {
      tenantId,
      projectId: resolved,
      pendencyId,
      action: 'STATUS_CHANGE',
      at: new Date().toISOString(),
      status: dto.status,
    });

    return updated;
  }

  async requestDocumentUpload(tenantId: string, dto: RequestDocumentUploadDto) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
    if (!family) throw new NotFoundException('Familia nao encontrada');

    const key = [
      'tenants',
      tenantId,
      'reurb',
      projectId,
      'familias',
      dto.familyId,
      dto.documentType,
      `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
    ].join('/');

    return this.storage.createPresignedUpload({
      key,
      contentType: dto.mimeType ?? 'application/octet-stream',
    });
  }

  async completeDocumentUpload(tenantId: string, dto: CompleteDocumentUploadDto, actorId?: string) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
    if (!family) throw new NotFoundException('Familia nao encontrada');

    const currentVersion =
      family.documents
        ?.filter((doc) => doc.documentType === dto.documentType)
        .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;

    family.documents.push({
      id: randomUUID(),
      documentType: dto.documentType,
      name: dto.fileName,
      key: dto.key,
      version: currentVersion + 1,
      status: dto.status ?? 'PENDENTE',
      metadata: dto.metadata ?? {},
      uploadedAt: new Date().toISOString(),
      uploadedBy: actorId ? asObjectId(actorId) : undefined,
    });

    family.updatedBy = actorId ? asObjectId(actorId) : family.updatedBy;
    await family.save();

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'FAMILY_DOCUMENT_UPLOAD',
      success: true,
      errors: [],
      details: { familyId: dto.familyId, documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return family;
  }

  async requestProjectDocumentUpload(tenantId: string, dto: RequestProjectDocumentUploadDto) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const project = await this.repository.findProjectById(tenantId, projectId);
    if (!project) throw new NotFoundException('Projeto nao encontrado');

    const key = [
      'tenants',
      tenantId,
      'reurb',
      projectId,
      'project_documents',
      dto.documentType,
      `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
    ].join('/');

    return this.storage.createPresignedUpload({
      key,
      contentType: dto.mimeType ?? 'application/octet-stream',
    });
  }

  async completeProjectDocumentUpload(
    tenantId: string,
    dto: CompleteProjectDocumentUploadDto,
    actorId?: string,
  ) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const project = await this.repository.findProjectById(tenantId, projectId);
    if (!project) throw new NotFoundException('Projeto nao encontrado');

    const currentVersion =
      project.documents
        ?.filter((doc) => doc.documentType === dto.documentType)
        .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;

    project.documents.push({
      id: randomUUID(),
      documentType: dto.documentType,
      name: dto.fileName,
      key: dto.key,
      version: currentVersion + 1,
      status: dto.status ?? 'PENDENTE',
      metadata: dto.metadata ?? {},
      uploadedAt: new Date().toISOString(),
      uploadedBy: actorId ? asObjectId(actorId) : undefined,
    });

    project.updatedBy = actorId ? asObjectId(actorId) : project.updatedBy;
    await project.save();

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'PROJECT_DOCUMENT_UPLOAD',
      success: true,
      errors: [],
      details: { documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return project;
  }

  async requestUnitDocumentUpload(tenantId: string, dto: RequestUnitDocumentUploadDto) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const unit = await this.repository.findUnitById(tenantId, projectId, dto.unitId);
    if (!unit) throw new NotFoundException('Unidade nao encontrada');

    const key = [
      'tenants',
      tenantId,
      'reurb',
      projectId,
      'units',
      dto.unitId,
      dto.documentType,
      `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
    ].join('/');

    return this.storage.createPresignedUpload({
      key,
      contentType: dto.mimeType ?? 'application/octet-stream',
    });
  }

  async completeUnitDocumentUpload(
    tenantId: string,
    dto: CompleteUnitDocumentUploadDto,
    actorId?: string,
  ) {
    const projectId = await this.resolveProjectId(tenantId, dto.projectId);
    const unit = await this.repository.findUnitById(tenantId, projectId, dto.unitId);
    if (!unit) throw new NotFoundException('Unidade nao encontrada');

    const currentVersion =
      unit.documents
        ?.filter((doc) => doc.documentType === dto.documentType)
        .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;

    unit.documents.push({
      id: randomUUID(),
      documentType: dto.documentType,
      name: dto.fileName,
      key: dto.key,
      version: currentVersion + 1,
      status: dto.status ?? 'PENDENTE',
      metadata: dto.metadata ?? {},
      uploadedAt: new Date().toISOString(),
      uploadedBy: actorId ? asObjectId(actorId) : undefined,
    });

    unit.updatedBy = actorId ? asObjectId(actorId) : unit.updatedBy;
    await unit.save();

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      action: 'UNIT_DOCUMENT_UPLOAD',
      success: true,
      errors: [],
      details: { unitId: dto.unitId, documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return unit;
  }

  async listNotificationTemplates(tenantId: string, projectId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listNotificationTemplates(tenantId, resolved);
  }

  async createNotificationTemplate(tenantId: string, dto: { projectId?: string; name: string; subject: string; body: string }) {
    const resolved = await this.resolveProjectId(tenantId, dto.projectId);
    const variables = Array.from(
      new Set((dto.body.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? []).map((item) => item.replace(/[{} ]/g, ''))),
    );
    const version = await this.repository.nextNotificationTemplateVersion(tenantId, resolved, dto.name);
    return this.repository.createNotificationTemplate({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolved),
      name: dto.name,
      subject: dto.subject,
      body: dto.body,
      variables,
      version,
      isActive: true,
    });
  }

  async updateNotificationTemplate(
    tenantId: string,
    projectId: string | undefined,
    templateId: string,
    dto: { subject?: string; body?: string; isActive?: boolean },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const updated = await this.repository.updateNotificationTemplate(tenantId, resolved, templateId, dto);
    if (!updated) throw new BadRequestException('Template nao encontrado');
    return updated;
  }

  async listNotifications(tenantId: string, projectId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listNotifications(tenantId, resolved);
  }

  async sendNotificationEmail(params: {
    tenantId: string;
    projectId?: string;
    templateId: string;
    to: string;
    variables?: Record<string, string | number>;
    actorId?: string;
  }) {
    const resolved = await this.resolveProjectId(params.tenantId, params.projectId);
    const template = await this.repository.findNotificationTemplateById(
      params.tenantId,
      resolved,
      params.templateId,
    );
    if (!template) throw new BadRequestException('Template nao encontrado');

    const body = template.body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
      const value = params.variables?.[key];
      return value !== undefined ? String(value) : '';
    });
    const subject = template.subject.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
      const value = params.variables?.[key];
      return value !== undefined ? String(value) : '';
    });

    let status: 'QUEUED' | 'SENT' | 'FAILED' = 'QUEUED';
    let error: string | undefined;
    if (this.mailTransport) {
      try {
        await this.mailTransport.sendMail({
          from: process.env.SMTP_FROM ?? 'no-reply@flydea.local',
          to: params.to,
          subject,
          text: body,
        });
        status = 'SENT';
      } catch (err) {
        status = 'FAILED';
        error = (err as Error).message;
      }
    }

    const notification = await this.repository.createNotification({
      tenantId: asObjectId(params.tenantId),
      projectId: asObjectId(resolved),
      templateId: asObjectId(template.id),
      templateName: template.name,
      templateVersion: template.version,
      channel: 'EMAIL',
      to: params.to,
      status,
      payload: params.variables ?? {},
      evidenceKeys: [],
      error,
      sentAt: status === 'SENT' ? new Date().toISOString() : undefined,
      createdBy: params.actorId ? asObjectId(params.actorId) : undefined,
    });

    await this.repository.createAuditLog({
      tenantId: asObjectId(params.tenantId),
      projectId: asObjectId(resolved),
      action: 'NOTIFICATION_EMAIL_SEND',
      success: status === 'SENT',
      errors: error ? [{ code: 'EMAIL_SEND_FAILED', message: error }] : [],
      details: { to: params.to, template: template.name },
      actorId: params.actorId ? asObjectId(params.actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return notification;
  }

  async attachNotificationEvidence(
    tenantId: string,
    projectId: string | undefined,
    notificationId: string,
    key: string,
    actorId?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const notification = await this.repository.findNotificationById(tenantId, resolved, notificationId);
    if (!notification) throw new NotFoundException('Notificacao nao encontrada');
    const updated = await this.repository.updateNotification(tenantId, resolved, notificationId, {
      evidenceKeys: Array.from(new Set([...(notification.evidenceKeys ?? []), key])),
    });
    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolved),
      action: 'NOTIFICATION_EVIDENCE_ATTACH',
      success: true,
      errors: [],
      details: { notificationId, key },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });
    return updated;
  }

  async requestNotificationEvidenceUpload(tenantId: string, projectId?: string, fileName?: string, mimeType?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const key = [
      'tenants',
      tenantId,
      'reurb',
      resolved,
      'notification_evidence',
      `${Date.now()}-${this.sanitizeName(fileName ?? 'evidencia')}`,
    ].join('/');
    return this.storage.createPresignedUpload({
      key,
      contentType: mimeType ?? 'application/octet-stream',
    });
  }

  async pingIntegration(
    tenantId: string,
    projectId: string | undefined,
    payload: Record<string, unknown>,
    actorId?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const url = process.env.INTEGRATION_HTTP_URL ?? 'https://httpbin.org/post';
    const method = (process.env.INTEGRATION_HTTP_METHOD ?? 'POST').toUpperCase();
    const startedAt = Date.now();
    let status = 'FAILED';
    let responseBody: unknown = null;
    let error: string | undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body:
          method === 'GET'
            ? undefined
            : JSON.stringify({
                tenantId,
                projectId: resolved,
                payload,
                sentAt: new Date().toISOString(),
              }),
      });
      status = response.ok ? 'SENT' : 'FAILED';
      responseBody = await response.json().catch(() => ({ ok: response.ok }));
      if (!response.ok) {
        error = `HTTP ${response.status}`;
      }
    } catch (err) {
      status = 'FAILED';
      error = (err as Error).message;
    }

    await this.repository.createAuditLog({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolved),
      action: 'INTEGRATION_HTTP_PING',
      success: status === 'SENT',
      errors: error ? [{ code: 'INTEGRATION_HTTP_FAILED', message: error }] : [],
      details: { url, durationMs: Date.now() - startedAt, payload },
      actorId: actorId ? asObjectId(actorId) : undefined,
      happenedAt: new Date().toISOString(),
    });

    return {
      status,
      url,
      response: responseBody,
      error,
    };
  }

  async getDossierSummary(tenantId: string, projectId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const [config, project, families, units] = await Promise.all([
      this.loadConfig(tenantId),
      this.repository.findProjectById(tenantId, resolved),
      this.repository.listFamilies(tenantId, resolved),
      this.repository.listUnits(tenantId, resolved),
    ]);
    if (!project) throw new NotFoundException('Projeto nao encontrado');

    const requiredFamily = config.documentNaming?.requiredDocumentTypes ?? [];
    const requiredProject = config.documentNaming?.requiredProjectDocumentTypes ?? [];
    const requiredUnit = config.documentNaming?.requiredUnitDocumentTypes ?? [];

    const projectMissing = requiredProject.filter(
      (doc) => !project.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'),
    );

    const familiesMissing = families.map((family) => {
      const missing = requiredFamily.filter(
        (doc) => !family.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'),
      );
      return { familyId: String((family as unknown as { id?: string }).id ?? ''), missing };
    });

    const unitsMissing = units.map((unit) => {
      const missing = requiredUnit.filter(
        (doc) => !unit.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'),
      );
      return { unitId: String((unit as unknown as { id?: string }).id ?? ''), missing };
    });

    return {
      project: {
        id: String((project as unknown as { id?: string }).id ?? ''),
        name: project.name,
        status: project.status,
        missingDocuments: projectMissing,
      },
      families: familiesMissing,
      units: unitsMissing,
    };
  }

  async generateCartorioPackage(
    tenantId: string,
    projectId: string | undefined,
    actorId?: string,
    purpose?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'GENERATE_CARTORIO_PACKAGE',
      purpose,
    });

    const columns = this.normalizeColumns(config);
    const rows = this.familyRowsForExport(families);
    const spreadsheetBuffer = await toXlsx(columns, rows);

    const approvedDocuments = await Promise.all(
      families
        .flatMap((family) =>
          (family.documents ?? [])
            .filter((doc) => doc.status === 'APROVADO')
            .map((doc) => ({
              key: doc.key,
              fileName: doc.name,
              nucleus: family.nucleus,
            })),
        )
        .map(async (doc) => {
          try {
            const blob = await this.storage.getObjectBuffer(doc.key);
            return {
              fileName: doc.fileName,
              content: blob.buffer,
              nucleus: doc.nucleus,
            };
          } catch {
            return {
              fileName: `${doc.fileName}.missing.txt`,
              content: Buffer.from(`Arquivo ausente no storage: ${doc.key}`, 'utf-8'),
              nucleus: doc.nucleus,
            };
          }
        }),
    );

    const extraFiles: Array<{ path: string; content: Buffer }> = [];
    const reportPath =
      process.env.REURB_ADERENCIA_PDF_PATH ??
      path.resolve(process.cwd(), 'docs', 'ubatuba-ce24-2025-aderencia-mvp.pdf');
    try {
      const reportContent = await fs.readFile(reportPath);
      extraFiles.push({ path: 'relatorios/aderencia-mvp.pdf', content: reportContent });
    } catch {
      // opcional: se nao existir, segue sem anexar
    }

    const zipBuffer = await buildCartorioZip({
      naming: {
        familyFolder: config.documentNaming?.familyFolder ?? 'familias',
        spreadsheetFolder: config.documentNaming?.spreadsheetFolder ?? 'planilha',
        titlesFolder: config.documentNaming?.titlesFolder ?? 'titulos',
        approvedDocumentsFolder: config.documentNaming?.approvedDocumentsFolder ?? 'documentos_aprovados',
      },
      spreadsheetFileName: 'planilha_sintese.xlsx',
      spreadsheetBuffer,
      familyRows: rows,
      approvedDocuments,
      extraFiles,
    });

    return this.persistDeliverable({
      tenantId,
      projectId: resolved,
      actorId,
      kind: 'PACOTE_CARTORIO_ZIP',
      fileNameBase: 'pacote_cartorio',
      extension: 'zip',
      payload: zipBuffer,
      metadata: {
        rows: rows.length,
        approvedDocuments: approvedDocuments.length,
        integrityHash: sha256Hex(zipBuffer),
      },
    });
  }

  async exportFamiliesJson(
    tenantId: string,
    projectId: string | undefined,
    actorId?: string,
    purpose?: string,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'EXPORT_BANCO_TABULADO',
      purpose,
    });

    const columns = this.normalizeColumns(config);
    const rows = this.familyRowsForExport(families);
    const payload = Buffer.from(JSON.stringify({ columns, rows }, null, 2), 'utf-8');

    return this.persistDeliverable({
      tenantId,
      projectId: resolved,
      actorId,
      kind: 'BANCO_TABULADO_JSON',
      fileNameBase: 'banco_tabulado_familias',
      extension: 'json',
      payload,
      metadata: {
        rows: rows.length,
        columns: columns.map((col) => col.key),
      },
    });
  }

  async listDeliverables(
    tenantId: string,
    projectId?: string,
    kind?: ReurbDeliverableKind,
    params?: { actorId?: string; purpose?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const deliverables = await this.repository.listDeliverables(tenantId, resolved, kind);
    await this.auditAccess({
      tenantId,
      projectId: resolved,
      actorId: params?.actorId,
      purpose: params?.purpose,
      action: 'ACCESS_DELIVERABLES_LIST',
      details: {
        count: deliverables.length,
        kind: kind ?? 'all',
      },
    });
    return deliverables;
  }

  async getDeliverableDownload(
    tenantId: string,
    deliverableId: string,
    projectId?: string,
    params?: { actorId?: string; purpose?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const deliverable = await this.repository.findDeliverableById(tenantId, resolved, deliverableId);
    if (!deliverable) throw new NotFoundException('Entregavel nao encontrado');
    const signed = await this.storage.createPresignedDownload({ key: deliverable.key });
    await this.auditAccess({
      tenantId,
      projectId: resolved,
      actorId: params?.actorId,
      purpose: params?.purpose,
      action: 'DOWNLOAD_DELIVERABLE',
      details: {
        deliverableId: String(deliverable._id),
        kind: deliverable.kind,
        fileName: deliverable.fileName,
      },
    });
    return signed;
  }

  private async persistDeliverable(params: {
    tenantId: string;
    projectId: string;
    actorId?: string;
    kind: ReurbDeliverableKind;
    fileNameBase: string;
    extension: string;
    payload: Buffer;
    metadata: Record<string, unknown>;
  }) {
    const actorObjectId = params.actorId ? asObjectId(params.actorId) : new Types.ObjectId();
    const version = await this.repository.nextDeliverableVersion(
      params.tenantId,
      params.projectId,
      params.kind,
    );

    const fileName = `${params.fileNameBase}_v${version}.${params.extension}`;
    const key = [
      'tenants',
      params.tenantId,
      'reurb',
      params.projectId,
      'deliverables',
      params.kind.toLowerCase(),
      fileName,
    ].join('/');

    await this.storage.putObject({
      key,
      content: params.payload,
      contentType:
        params.extension === 'zip'
          ? 'application/zip'
          : params.extension === 'csv'
            ? 'text/csv'
            : params.extension === 'json'
              ? 'application/json'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const hashSha256 = sha256Hex(params.payload);
    const deliverable = await this.repository.createDeliverable({
      tenantId: asObjectId(params.tenantId),
      projectId: asObjectId(params.projectId),
      kind: params.kind,
      version,
      fileName,
      key,
      hashSha256,
      validationErrors: [],
      metadata: params.metadata,
      generatedBy: actorObjectId,
      generatedAt: new Date().toISOString(),
    });

    return {
      ...deliverable.toObject(),
      hashSha256,
    };
  }

  async listAuditLogs(
    tenantId: string,
    projectId?: string,
    action?: string,
    limit?: number,
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listAuditLogs(tenantId, resolved, { action, limit });
  }
}
