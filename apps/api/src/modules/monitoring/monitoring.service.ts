import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AlertsService } from '../alerts/alerts.service';
import { CacheService } from '../shared/cache.service';
import { CreateEnvironmentEventDto } from './dto/create-environment-event.dto';
import { UpdateEnvironmentEventDto } from './dto/update-environment-event.dto';
import { MonitoringRepository } from './monitoring.repository';

@Injectable()
export class MonitoringService {
  private readonly transitionMap: Record<string, string[]> = {
    INGESTAO: ['TRIAGEM', 'EVIDENCIA'],
    TRIAGEM: ['FISCALIZACAO', 'EVIDENCIA', 'NOTIFICACAO', 'DESFECHO'],
    FISCALIZACAO: ['EVIDENCIA', 'NOTIFICACAO', 'DESFECHO'],
    EVIDENCIA: ['FISCALIZACAO', 'NOTIFICACAO', 'DESFECHO'],
    NOTIFICACAO: ['FISCALIZACAO', 'DESFECHO'],
    DESFECHO: [],
  };

  constructor(
    private readonly repository: MonitoringRepository,
    private readonly alertsService: AlertsService,
    private readonly cacheService: CacheService,
  ) {}

  list(
    tenantId: string,
    filters?: {
      stage?: string;
      severity?: string;
      type?: string;
      sourceMode?: string;
      assignedTo?: string;
    },
  ) {
    return this.repository.list(tenantId, filters);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async ingest(tenantId: string, dto: CreateEnvironmentEventDto, actorId?: string) {
    const event = await this.repository.create({
      tenantId: tenantId as any,
      type: dto.type as never,
      title: dto.title,
      severity: dto.severity,
      stage: 'INGESTAO',
      classification: dto.classification as never,
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
      evidenceKeys: dto.evidenceKeys ?? [],
      source: dto.source,
      sourceMode: dto.sourceMode ?? 'MANUAL',
      sourceAdapter: dto.sourceAdapter,
      externalReference: dto.externalReference,
      observedAt: dto.observedAt ?? new Date().toISOString(),
      assignedTo: dto.source,
      timeline: [
        {
          id: randomUUID(),
          stage: 'INGESTAO',
          message: 'Evento ambiental ingerido',
          createdAt: new Date().toISOString(),
          actorId,
        },
      ],
    });

    await this.alertsService.create(tenantId, {
      title: dto.title,
      level: dto.severity,
      lat: dto.lat,
      lng: dto.lng,
      assignedTo: dto.source,
      evidenceKeys: dto.evidenceKeys,
    });
    await this.cacheService.invalidateByPrefix(`monitoring:${tenantId}`);
    return event;
  }

  private ensureTransition(currentStage: string, nextStage: string) {
    if (currentStage === nextStage) return;
    const allowed = this.transitionMap[currentStage] ?? [];
    if (!allowed.includes(nextStage)) {
      throw new BadRequestException(`Transicao invalida: ${currentStage} -> ${nextStage}`);
    }
  }

  async advance(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Evento nao encontrado');
    const nextStage = dto.stage ?? (dto.evidenceKey ? 'EVIDENCIA' : undefined);
    if (nextStage) {
      this.ensureTransition(current.stage, nextStage);
      current.stage = nextStage as any;
      current.timeline.unshift({
        id: randomUUID(),
        stage: nextStage as any,
        message: dto.message ?? `Status alterado para ${nextStage}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
      if (nextStage === 'DESFECHO') {
        current.resolvedAt = new Date().toISOString();
      }
      if (nextStage === 'NOTIFICACAO') {
        current.notifiedAt = new Date().toISOString();
      }
    } else if (dto.stage) {
      current.stage = dto.stage;
      current.timeline.unshift({
        id: randomUUID(),
        stage: dto.stage,
        message: dto.message ?? `Status alterado para ${dto.stage}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    if (dto.assignedTo) {
      current.assignedTo = dto.assignedTo;
      current.timeline.unshift({
        id: randomUUID(),
        stage: current.stage,
        message: `Atribuido para ${dto.assignedTo}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    if (dto.evidenceKey) {
      current.evidenceKeys = Array.from(new Set([...(current.evidenceKeys ?? []), dto.evidenceKey]));
      current.timeline.unshift({
        id: randomUUID(),
        stage: current.stage,
        message: `Evidencia anexada: ${dto.evidenceKey}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    if (dto.sourceAdapter) {
      current.sourceAdapter = dto.sourceAdapter;
    }
    await this.cacheService.invalidateByPrefix(`monitoring:${tenantId}`);
    return current.save();
  }

  async triage(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string) {
    return this.advance(tenantId, id, { ...dto, stage: 'TRIAGEM' }, actorId);
  }

  async assign(tenantId: string, id: string, assignedTo: string, actorId?: string) {
    return this.advance(tenantId, id, { stage: 'FISCALIZACAO', assignedTo }, actorId);
  }

  async notify(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string) {
    return this.advance(tenantId, id, { ...dto, stage: 'NOTIFICACAO' }, actorId);
  }

  async close(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string) {
    return this.advance(tenantId, id, { ...dto, stage: 'DESFECHO' }, actorId);
  }

  async dashboard(
    tenantId: string,
    filters?: {
      stage?: string;
      severity?: string;
      type?: string;
      sourceMode?: string;
      assignedTo?: string;
    },
  ) {
    const items = await this.repository.list(tenantId, filters);
    const sourceBreakdown = items.reduce((acc, item) => {
      const key = String(item.source ?? 'SEM_FONTE');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const typeBreakdown = items.reduce((acc, item) => {
      const key = String(item.type ?? 'SEM_TIPO');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sourceModeBreakdown = items.reduce((acc, item: any) => {
      const key = String(item.sourceMode ?? 'MANUAL');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const recentTimeline = [...items]
      .sort((a, b) => {
        const aAny = a as any;
        const bAny = b as any;
        return Number(new Date(bAny.updatedAt ?? bAny.createdAt ?? 0)) - Number(new Date(aAny.updatedAt ?? aAny.createdAt ?? 0));
      })
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        stage: item.stage,
        severity: item.severity,
        source: item.source ?? 'SEM_FONTE',
        resolvedAt: item.resolvedAt ?? null,
      }));
    return {
      total: items.length,
      triagem: items.filter((item) => item.stage === 'TRIAGEM').length,
      fiscalizacao: items.filter((item) => item.stage === 'FISCALIZACAO').length,
      notificacao: items.filter((item) => item.stage === 'NOTIFICACAO').length,
      desfecho: items.filter((item) => item.stage === 'DESFECHO').length,
      criticidadeAlta: items.filter((item) => item.severity === 'ALTA' || item.severity === 'CRITICA').length,
      comEvidencia: items.filter((item) => (item.evidenceKeys?.length ?? 0) > 0).length,
      semAtribuicao: items.filter((item) => !item.assignedTo).length,
      notificados: items.filter((item) => Boolean(item.notifiedAt)).length,
      sourceBreakdown: Object.entries(sourceBreakdown)
        .map(([source, total]) => ({ source, total }))
        .sort((a, b) => b.total - a.total),
      typeBreakdown: Object.entries(typeBreakdown)
        .map(([type, total]) => ({ type, total }))
        .sort((a, b) => b.total - a.total),
      sourceModeBreakdown: Object.entries(sourceModeBreakdown)
        .map(([sourceMode, total]) => ({ sourceMode, total }))
        .sort((a, b) => b.total - a.total),
      feedAdapters: [
        { adapter: 'CEMADEN', mode: 'API', status: 'READY_FOR_INTEGRATION' },
        { adapter: 'INMET', mode: 'API', status: 'READY_FOR_INTEGRATION' },
        { adapter: 'INPE', mode: 'SATELLITE', status: 'READY_FOR_INTEGRATION' },
      ],
      recentTimeline,
    };
  }
}
