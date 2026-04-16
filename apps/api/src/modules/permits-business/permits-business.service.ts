import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { CreatePermitBusinessDto } from './dto/create-permit-business.dto';
import { UpdatePermitBusinessDto } from './dto/update-permit-business.dto';
import { PermitsBusinessRepository } from './permits-business.repository';

const BUSINESS_STAGE_TO_STATUS = {
  ABERTURA: 'ABERTO',
  ANALISE_TECNICA: 'EM_ANALISE',
  EXIGENCIAS: 'EXIGENCIA',
  PARECER: 'EM_ANALISE',
  TAXAS: 'EM_TAXA',
  ASSINATURA: 'EMISSAO',
  EMISSAO: 'EMITIDO',
  ENCERRAMENTO: 'ENCERRADO',
  INDEFERIDO: 'INDEFERIDO',
} as const;

const BUSINESS_TRANSITIONS = {
  ABERTURA: ['ANALISE_TECNICA', 'EXIGENCIAS', 'INDEFERIDO'],
  ANALISE_TECNICA: ['EXIGENCIAS', 'PARECER', 'TAXAS', 'INDEFERIDO'],
  EXIGENCIAS: ['ANALISE_TECNICA', 'PARECER', 'INDEFERIDO'],
  PARECER: ['TAXAS', 'ASSINATURA', 'EXIGENCIAS', 'INDEFERIDO'],
  TAXAS: ['ASSINATURA', 'INDEFERIDO'],
  ASSINATURA: ['EMISSAO', 'INDEFERIDO'],
  EMISSAO: ['ENCERRAMENTO'],
  ENCERRAMENTO: [],
  INDEFERIDO: [],
} as const;

function buildSimplePdf(lines: string[]) {
  const safe = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
  const body = safe.map((line, index) => `${index === 0 ? '' : '0 -20 Td '}(${line}) Tj`).join('\n');
  return Buffer.from(
    [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${body.length + 80} >> stream`,
      'BT /F1 14 Tf 50 780 Td',
      body,
      'ET',
      'endstream endobj',
      'xref',
      '0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000063 00000 n ',
      '0000000120 00000 n ',
      '0000000240 00000 n ',
      '0000000310 00000 n ',
      'trailer << /Size 6 /Root 1 0 R >>',
      'startxref',
      '380',
      '%%EOF',
    ].join('\n'),
  );
}

@Injectable()
export class PermitsBusinessService {
  constructor(
    private readonly repository: PermitsBusinessRepository,
    private readonly projectsService: ProjectsService,
    private readonly storage: ObjectStorageService,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.repository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreatePermitBusinessDto, actorId?: string) {
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const protocolNumber = `EM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const request = await this.repository.create({
      tenantId: tenantId as any,
      projectId,
      protocolNumber,
      companyName: dto.companyName,
      cnpj: dto.cnpj,
      activityDescription: dto.activityDescription,
      status: 'ABERTO',
      currentStage: 'ABERTURA',
      responsibleDepartment: 'Urbanismo / Obras',
      history: [
        {
          id: randomUUID(),
          status: 'ABERTO',
          stage: 'ABERTURA',
          action: 'ABRIR_PROCESSO',
          message: 'Solicitacao aberta',
          createdAt: new Date().toISOString(),
          actorId,
        },
      ],
      taxes: [],
    });
    await this.cacheService.invalidateByPrefix(`permits-business:${tenantId}`);
    return request;
  }

  async update(tenantId: string, id: string, dto: UpdatePermitBusinessDto, actorId?: string) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    if (dto.stage) {
      this.transition(request, dto.stage as keyof typeof BUSINESS_STAGE_TO_STATUS, dto.message, actorId);
    } else if (dto.status) {
      request.status = dto.status;
      request.history.push({
        id: randomUUID(),
        status: dto.status,
        stage: request.currentStage,
        action: 'UPDATE_STATUS',
        message: dto.message ?? `Status alterado para ${dto.status}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    return this.repository.save(request);
  }

  async addTax(tenantId: string, id: string, description: string, amount: number) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    request.taxes.push({
      id: randomUUID(),
      description,
      amount,
      status: 'PENDENTE',
      createdAt: new Date().toISOString(),
    });
    this.transition(request, 'TAXAS', `Taxa adicionada: ${description}`);
    return this.repository.save(request);
  }

  async addRequirementResponse(tenantId: string, id: string, note: string, actorId?: string) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    request.evidences.push({
      id: randomUUID(),
      title: 'Atendimento de exigencia',
      note,
      createdAt: new Date().toISOString(),
      createdBy: actorId,
    });
    request.history.push({
      id: randomUUID(),
      status: request.status,
      stage: request.currentStage,
      action: 'ATENDER_EXIGENCIA',
      message: note,
      createdAt: new Date().toISOString(),
      actorId,
    });
    request.currentStage = 'EXIGENCIAS';
    request.status = 'EXIGENCIA';
    return this.repository.save(request);
  }

  async addEvidence(tenantId: string, id: string, title: string, note?: string, fileName?: string, actorId?: string) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    request.evidences.push({
      id: randomUUID(),
      title,
      note,
      fileName,
      createdAt: new Date().toISOString(),
      createdBy: actorId,
    });
    request.history.push({
      id: randomUUID(),
      status: request.status,
      stage: request.currentStage,
      action: 'ANEXAR_EVIDENCIA',
      message: title,
      createdAt: new Date().toISOString(),
      actorId,
    });
    return this.repository.save(request);
  }

  async decide(
    tenantId: string,
    id: string,
    decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO',
    reason?: string,
    actorId?: string,
  ) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    request.decision = {
      kind: decision,
      reason,
      at: new Date().toISOString(),
      actorId,
    };
    if (decision === 'DEFERIDO') {
      this.transition(request, 'ENCERRAMENTO', reason ?? 'Processo deferido', actorId, true);
    } else if (decision === 'INDEFERIDO') {
      this.transition(request, 'INDEFERIDO', reason ?? 'Processo indeferido', actorId, true);
    } else {
      this.transition(request, 'EXIGENCIAS', reason ?? 'Processo devolvido para atendimento', actorId, true);
      request.status = 'EXIGENCIA';
    }
    return this.repository.save(request);
  }

  async issuePermit(tenantId: string, id: string) {
    const request = await this.repository.findById(tenantId, id);
    if (!request) throw new NotFoundException('Solicitacao nao encontrada');
    const pdf = buildSimplePdf([
      'Alvara Digital de Empresas',
      `Protocolo: ${request.protocolNumber}`,
      `Empresa: ${request.companyName}`,
      `CNPJ: ${request.cnpj}`,
      `Status: ${request.status}`,
    ]);
    const key = `permits-business/${tenantId}/${request.protocolNumber}.pdf`;
    await this.storage.putObject({ key, content: pdf, contentType: 'application/pdf' });
    request.permitPdfKey = key;
    this.transition(request, 'EMISSAO', 'Alvara emitido', undefined, true);
    request.history.push({
      id: randomUUID(),
      status: 'EMITIDO',
      stage: 'EMISSAO',
      action: 'GERAR_PDF',
      message: 'Alvara emitido',
      createdAt: new Date().toISOString(),
    });
    return this.repository.save(request);
  }

  private transition(request: any, stage: keyof typeof BUSINESS_STAGE_TO_STATUS, message?: string, actorId?: string, force = false) {
    const allowed = BUSINESS_TRANSITIONS[request.currentStage as keyof typeof BUSINESS_TRANSITIONS] as ReadonlyArray<
      keyof typeof BUSINESS_STAGE_TO_STATUS
    >;
    if (!force && request.currentStage !== stage && !allowed.includes(stage)) {
      throw new BadRequestException(`Transicao invalida de ${request.currentStage} para ${stage}`);
    }
    request.currentStage = stage;
    request.status = BUSINESS_STAGE_TO_STATUS[stage];
    request.history.push({
      id: randomUUID(),
      status: request.status,
      stage,
      action: 'TRANSICAO',
      message: message ?? `Etapa alterada para ${stage}`,
      createdAt: new Date().toISOString(),
      actorId,
    });
  }
}
