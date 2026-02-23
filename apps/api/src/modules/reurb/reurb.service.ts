import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { Types } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import {
  CompleteDocumentUploadDto,
  CreatePendencyDto,
  CreateReurbFamilyDto,
  RequestDocumentUploadDto,
  UpdatePendencyStatusDto,
  UpdateReurbFamilyDto,
  UpsertTenantConfigDto,
} from './dto/reurb.dto';
import {
  ReurbDeliverableKind,
  ReurbFamily,
  TenantConfig,
} from './reurb.schema';
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

@Injectable()
export class ReurbService {
  private readonly pendencyEvents = new EventEmitter();

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

  async getTenantConfig(tenantId: string) {
    return this.loadConfig(tenantId);
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

    return this.repository.createFamily({
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
  }

  async listFamilies(
    tenantId: string,
    projectId?: string,
    filters?: { status?: string; nucleus?: string; q?: string },
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listFamilies(tenantId, resolved, filters);
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
    return updated;
  }

  async exportFamiliesCsv(tenantId: string, projectId: string | undefined, actorId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'EXPORT_BANCO_TABULADO',
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

  async exportFamiliesXlsx(tenantId: string, projectId: string | undefined, actorId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'EXPORT_BANCO_TABULADO',
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

  async generatePlanilhaSintese(tenantId: string, projectId: string | undefined, actorId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'GENERATE_PLANILHA',
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
  ) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listPendencies(tenantId, resolved, filters);
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

    return family;
  }

  async generateCartorioPackage(tenantId: string, projectId: string | undefined, actorId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const { config, families } = await this.validateAndAudit({
      tenantId,
      projectId: resolved,
      actorId,
      action: 'GENERATE_CARTORIO_PACKAGE',
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

  async listDeliverables(tenantId: string, projectId?: string, kind?: ReurbDeliverableKind) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    return this.repository.listDeliverables(tenantId, resolved, kind);
  }

  async getDeliverableDownload(tenantId: string, deliverableId: string, projectId?: string) {
    const resolved = await this.resolveProjectId(tenantId, projectId);
    const deliverable = await this.repository.findDeliverableById(tenantId, resolved, deliverableId);
    if (!deliverable) throw new NotFoundException('Entregavel nao encontrado');
    return this.storage.createPresignedDownload({ key: deliverable.key });
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
}
