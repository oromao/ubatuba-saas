import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CacheService } from '../shared/cache.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsRepository } from './alerts.repository';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsRepository: AlertsRepository,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.alertsRepository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.alertsRepository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreateAlertDto) {
    const created = await this.alertsRepository.create({
      tenantId: asObjectId(tenantId),
      title: dto.title,
      level: dto.level,
      status: 'ABERTO',
      stage: 'TRIAGEM',
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
      evidenceKeys: dto.evidenceKeys ?? [],
      assignedTo: dto.assignedTo,
      timeline: [
        {
          id: randomUUID(),
          stage: 'TRIAGEM',
          message: 'Alerta criado e encaminhado para triagem',
          createdAt: new Date().toISOString(),
          evidenceKeys: dto.evidenceKeys ?? [],
        },
      ],
    });
    await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateAlertDto) {
    const updated = await this.alertsRepository.update(tenantId, id, dto);
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }

  async ack(tenantId: string, id: string) {
    const updated = await this.alertsRepository.update(tenantId, id, {
      status: 'EM_ANALISE',
      stage: 'FISCALIZACAO',
    });
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }

  async resolve(tenantId: string, id: string) {
    const updated = await this.alertsRepository.update(tenantId, id, {
      status: 'RESOLVIDO',
      stage: 'DESFECHO',
      resolvedAt: new Date().toISOString(),
    });
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.alertsRepository.delete(tenantId, id);
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return { success: true };
  }

  async advanceStage(
    tenantId: string,
    id: string,
    stage: 'TRIAGEM' | 'FISCALIZACAO' | 'EVIDENCIA' | 'NOTIFICACAO' | 'DESFECHO',
    message: string,
    actorId?: string,
    evidenceKeys?: string[],
  ) {
    const current = await this.alertsRepository.findById(tenantId, id);
    if (!current) return null;
    const timeline = Array.isArray((current as { timeline?: unknown }).timeline)
      ? ((current as { timeline?: Array<Record<string, unknown>> }).timeline ?? [])
      : [];
    timeline.unshift({
      id: randomUUID(),
      stage,
      message,
      createdAt: new Date().toISOString(),
      actorId,
      evidenceKeys,
    });
    const updated = await this.alertsRepository.update(tenantId, id, {
      stage,
      evidenceKeys: evidenceKeys ?? current.evidenceKeys ?? [],
      timeline: timeline as never,
    });
    if (stage === 'DESFECHO') {
      await this.alertsRepository.update(tenantId, id, { resolvedAt: new Date().toISOString() });
    }
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }
}
