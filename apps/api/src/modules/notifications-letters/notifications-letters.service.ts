import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { asObjectId } from '../../common/utils/object-id';
import { ParcelsRepository } from '../ctm/parcels/parcels.repository';
import { ProjectsService } from '../projects/projects.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import {
  CreateLetterTemplateDto,
  GenerateLetterBatchDto,
  PreviewTemplateDto,
  UpdateLetterStatusDto,
  UpdateLetterTemplateDto,
} from './dto/letters.dto';
import { LetterBatchDocument } from './letter-batch.schema';
import { NotificationsLettersRepository } from './notifications-letters.repository';
import { buildSimplePdf, renderTemplate } from './pdf.util';

@Injectable()
export class NotificationsLettersService {
  constructor(
    private readonly repository: NotificationsLettersRepository,
    private readonly projectsService: ProjectsService,
    private readonly parcelsRepository: ParcelsRepository,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  private async resolveProject(tenantId: string, projectId?: string) {
    return this.projectsService.resolveProjectId(tenantId, projectId);
  }

  private buildVariablesFromParcel(parcel: {
    sqlu?: string;
    inscription?: string;
    inscricaoImobiliaria?: string;
    mainAddress?: string;
    status?: string;
  }) {
    return {
      sqlu: parcel.sqlu ?? '',
      inscricao: parcel.inscricaoImobiliaria ?? parcel.inscription ?? '',
      endereco: parcel.mainAddress ?? '',
      status: parcel.status ?? '',
    };
  }

  private updateBatchStatus(batch: LetterBatchDocument) {
    const hasReturned = batch.letters.some((letter) => letter.status === 'DEVOLVIDA');
    if (hasReturned) {
      batch.status = 'DEVOLVIDA';
      return;
    }
    const allDelivered = batch.letters.length > 0 && batch.letters.every((letter) => letter.status === 'ENTREGUE');
    if (allDelivered) {
      batch.status = 'ENTREGUE';
      return;
    }
    batch.status = 'GERADA';
  }

  async listTemplates(tenantId: string, projectId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    return this.repository.listTemplates(tenantId, String(resolvedProject));
  }

  async createTemplate(tenantId: string, dto: CreateLetterTemplateDto) {
    const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
    const variables = Array.from(new Set((dto.html.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? []).map((item) => item.replace(/[{} ]/g, ''))));
    const version = await this.repository.getNextTemplateVersion(tenantId, String(resolvedProject), dto.name);
    return this.repository.createTemplate({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      name: dto.name,
      version,
      html: dto.html,
      variables,
      isActive: true,
    });
  }

  async updateTemplate(
    tenantId: string,
    projectId: string | undefined,
    templateId: string,
    dto: UpdateLetterTemplateDto,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const updated = await this.repository.updateTemplate(
      tenantId,
      String(resolvedProject),
      templateId,
      dto,
    );
    if (!updated) throw new BadRequestException('Template nao encontrado');
    return updated;
  }

  previewTemplate(dto: PreviewTemplateDto) {
    return {
      renderedHtml: renderTemplate(dto.html, dto.variables ?? {}),
    };
  }

  async generateBatch(tenantId: string, dto: GenerateLetterBatchDto, actorId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
    const projectId = String(resolvedProject);
    const template = await this.repository.findTemplateById(tenantId, projectId, dto.templateId);
    if (!template) throw new BadRequestException('Template nao encontrado');

    const parcels = await this.parcelsRepository.list(tenantId, {
      projectId,
      status: dto.parcelStatus,
    });
    const protocol = `NOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const letters: Array<{
      id: string;
      parcelId: string;
      sqlu?: string;
      address?: string;
      status: 'GERADA' | 'ENTREGUE' | 'DEVOLVIDA';
      fileKey: string;
      generatedAt: string;
      deliveredAt?: string;
      returnedAt?: string;
    }> = [];

    for (const parcel of parcels) {
      const letterId = randomUUID();
      const variables = this.buildVariablesFromParcel(parcel);
      const renderedText = renderTemplate(template.html, variables);
      const pdf = buildSimplePdf(renderedText);
      const key = `tenants/${tenantId}/letters/${protocol}/${letterId}.pdf`;
      await this.objectStorageService.putObject({
        key,
        content: pdf,
        contentType: 'application/pdf',
      });
      letters.push({
        id: letterId,
        parcelId: parcel.id,
        sqlu: parcel.sqlu,
        address: parcel.mainAddress,
        status: 'GERADA',
        fileKey: key,
        generatedAt: new Date().toISOString(),
      });
    }

    return this.repository.createBatch({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProject,
      templateId: asObjectId(template.id),
      templateName: template.name,
      templateVersion: template.version,
      protocol,
      status: 'GERADA',
      filter: {
        parcelWorkflowStatus: dto.parcelWorkflowStatus,
        parcelStatus: dto.parcelStatus,
      },
      letters,
      createdBy: actorId ? asObjectId(actorId) : undefined,
    });
  }

  async listBatches(tenantId: string, projectId?: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    return this.repository.listBatches(tenantId, String(resolvedProject));
  }

  async findBatchById(tenantId: string, projectId: string | undefined, batchId: string) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
    if (!batch) throw new BadRequestException('Lote nao encontrado');
    return batch;
  }

  async updateLetterStatus(
    tenantId: string,
    projectId: string | undefined,
    batchId: string,
    letterId: string,
    dto: UpdateLetterStatusDto,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
    if (!batch) throw new BadRequestException('Lote nao encontrado');
    const index = batch.letters.findIndex((item) => item.id === letterId);
    if (index < 0) throw new BadRequestException('Carta nao encontrada');

    batch.letters[index].status = dto.status;
    if (dto.status === 'ENTREGUE') {
      batch.letters[index].deliveredAt = new Date().toISOString();
    }
    if (dto.status === 'DEVOLVIDA') {
      batch.letters[index].returnedAt = new Date().toISOString();
    }
    this.updateBatchStatus(batch);
    return this.repository.saveBatch(batch);
  }

  async getLetterDownloadUrl(
    tenantId: string,
    projectId: string | undefined,
    batchId: string,
    letterId: string,
  ) {
    const resolvedProject = await this.resolveProject(tenantId, projectId);
    const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
    if (!batch) throw new BadRequestException('Lote nao encontrado');
    const letter = batch.letters.find((item) => item.id === letterId);
    if (!letter) throw new BadRequestException('Carta nao encontrada');
    return this.objectStorageService.createPresignedDownload({ key: letter.fileKey });
  }
}

