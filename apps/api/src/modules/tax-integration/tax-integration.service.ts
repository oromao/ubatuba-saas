import { BadRequestException, Injectable } from '@nestjs/common';
import { asObjectId } from '../../common/utils/object-id';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaxConnectorDto, RunTaxSyncDto, UpdateTaxConnectorDto } from './dto/tax-integration.dto';
import { TaxConnectorDocument, TaxConnectorMode } from './tax-connector.schema';
import { TaxIntegrationRepository } from './tax-integration.repository';

type SyncResult = {
  status: 'SUCESSO' | 'ERRO';
  processed: number;
  inserted?: number;
  updated?: number;
  errors?: number;
  message?: string;
};

@Injectable()
export class TaxIntegrationService {
  constructor(
    private readonly repository: TaxIntegrationRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  private async resolveProject(tenantId: string, projectId?: string) {
    return this.projectsService.resolveProjectId(tenantId, projectId);
  }

  private parseCsvRows(csvContent: string) {
    const lines = csvContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return { headers: [] as string[], rows: [] as Record<string, string>[] };
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });
    return { headers, rows };
  }

  private async executeRestSync(connector: TaxConnectorDocument): Promise<SyncResult> {
    const endpoint = String(connector.config?.endpoint ?? '');
    if (!endpoint) {
      return { status: 'ERRO', processed: 0, errors: 1, message: 'Endpoint REST nao configurado.' };
    }
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: connector.config?.token
          ? { Authorization: `Bearer ${String(connector.config.token)}` }
          : undefined,
      });
      if (!response.ok) {
        return {
          status: 'ERRO',
          processed: 0,
          errors: 1,
          message: `HTTP ${response.status}`,
        };
      }
      const payload = (await response.json()) as unknown;
      const list = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data: unknown }).data)
          ? ((payload as { data: unknown[] }).data ?? [])
          : [];
      return {
        status: 'SUCESSO',
        processed: list.length,
        inserted: list.length,
        updated: 0,
        errors: 0,
        message: 'Sincronizacao REST concluida.',
      };
    } catch {
      return { status: 'ERRO', processed: 0, errors: 1, message: 'Falha de conexao REST.' };
    }
  }

  private async executeCsvSync(
    connector: TaxConnectorDocument,
    input?: RunTaxSyncDto,
  ): Promise<SyncResult> {
    const csvContent = input?.csvContent ?? String(connector.config?.csvSample ?? '');
    if (!csvContent) {
      return { status: 'ERRO', processed: 0, errors: 1, message: 'CSV nao informado.' };
    }
    const parsed = this.parseCsvRows(csvContent);
    return {
      status: 'SUCESSO',
      processed: parsed.rows.length,
      inserted: parsed.rows.length,
      updated: 0,
      errors: 0,
      message: `CSV processado com ${parsed.rows.length} linhas.`,
    };
  }

  private async executeSftpSync(connector: TaxConnectorDocument): Promise<SyncResult> {
    const host = String(connector.config?.host ?? '');
    if (!host) {
      return { status: 'ERRO', processed: 0, errors: 1, message: 'Host SFTP nao configurado.' };
    }
    return {
      status: 'SUCESSO',
      processed: 0,
      inserted: 0,
      updated: 0,
      errors: 0,
      message: 'Conector SFTP em modo stub validado.',
    };
  }

  private async executeSyncByMode(
    mode: TaxConnectorMode,
    connector: TaxConnectorDocument,
    input?: RunTaxSyncDto,
  ): Promise<SyncResult> {
    if (mode === 'REST_JSON') return this.executeRestSync(connector);
    if (mode === 'CSV_UPLOAD') return this.executeCsvSync(connector, input);
    return this.executeSftpSync(connector);
  }

  async listConnectors(tenantId: string, projectId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    return this.repository.listConnectors(tenantId, String(resolvedProject));
  }

  async createConnector(tenantId: string, dto: CreateTaxConnectorDto, userId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
    return this.repository.createConnector({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      name: dto.name,
      mode: dto.mode,
      config: dto.config ?? {},
      fieldMapping: dto.fieldMapping ?? {},
      isActive: dto.isActive ?? true,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async updateConnector(
    tenantId: string,
    projectId: string | undefined,
    connectorId: string,
    dto: UpdateTaxConnectorDto,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const updated = await this.repository.updateConnector(tenantId, String(resolvedProject), connectorId, dto);
    if (!updated) throw new BadRequestException('Conector nao encontrado');
    return updated;
  }

  async testConnection(tenantId: string, projectId: string | undefined, connectorId: string, actorId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const connector = await this.repository.findConnectorById(
      tenantId,
      String(resolvedProject),
      connectorId,
    );
    if (!connector) throw new BadRequestException('Conector nao encontrado');

    const result = await this.executeSyncByMode(connector.mode, connector);
    await this.repository.createLog({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      connectorId: asObjectId(connector.id),
      trigger: 'TEST',
      status: result.status,
      summary: {
        processed: result.processed,
        inserted: result.inserted,
        updated: result.updated,
        errors: result.errors,
        message: result.message,
      },
      errorMessage: result.status === 'ERRO' ? result.message : undefined,
      startedBy: actorId ? asObjectId(actorId) : undefined,
    });

    return result;
  }

  async runSync(
    tenantId: string,
    projectId: string | undefined,
    connectorId: string,
    dto: RunTaxSyncDto,
    actorId?: string,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const connector = await this.repository.findConnectorById(
      tenantId,
      String(resolvedProject),
      connectorId,
    );
    if (!connector) throw new BadRequestException('Conector nao encontrado');

    const result = await this.executeSyncByMode(connector.mode, connector, dto);
    await this.repository.createLog({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      connectorId: asObjectId(connector.id),
      trigger: 'MANUAL',
      status: result.status,
      summary: {
        processed: result.processed,
        inserted: result.inserted,
        updated: result.updated,
        errors: result.errors,
        message: result.message,
      },
      errorMessage: result.status === 'ERRO' ? result.message : undefined,
      startedBy: actorId ? asObjectId(actorId) : undefined,
    });

    if (result.status === 'SUCESSO') {
      await this.repository.updateConnector(tenantId, String(resolvedProject), connectorId, {
        lastSyncAt: new Date(),
      });
    }
    return result;
  }

  async listLogs(tenantId: string, projectId: string | undefined, connectorId: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    return this.repository.listLogs(tenantId, String(resolvedProject), connectorId);
  }
}

