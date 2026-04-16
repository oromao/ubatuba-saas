import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AlertsService } from '../alerts/alerts.service';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { CreateCitizenCallDto } from './dto/create-citizen-call.dto';
import { UpdateCitizenCallDto } from './dto/update-citizen-call.dto';
import { Citizen156Repository } from './citizen-156.repository';

@Injectable()
export class Citizen156Service {
  constructor(
    private readonly repository: Citizen156Repository,
    private readonly projectsService: ProjectsService,
    private readonly alertsService: AlertsService,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.repository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreateCitizenCallDto, actorId?: string) {
    const projectId = await this.projectsService.resolveProjectId(tenantId);
    const protocolNumber = `156-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const created = await this.repository.create({
      tenantId: tenantId as any,
      projectId,
      protocolNumber,
      title: dto.title,
      category: dto.category,
      status: 'ABERTO',
      reporterName: dto.reporterName,
      reporterContact: dto.reporterContact,
      processId: dto.processId,
      alertId: dto.alertId,
      attachmentKeys: dto.attachmentKeys ?? [],
      history: [
        {
          id: randomUUID(),
          status: 'ABERTO',
          message: 'Chamado aberto',
          createdAt: new Date().toISOString(),
          actorId,
        },
      ],
    });
    if (dto.alertId) {
      await this.alertsService.advanceStage(tenantId, dto.alertId, 'NOTIFICACAO', 'Chamado 156 vinculado ao alerta');
    }
    await this.cacheService.invalidateByPrefix(`citizen-156:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateCitizenCallDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Chamado nao encontrado');
    if (dto.status) {
      current.status = dto.status;
      current.history.unshift({
        id: randomUUID(),
        status: dto.status,
        message: dto.message ?? `Status alterado para ${dto.status}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    return this.repository.save(current);
  }

  async summary(tenantId: string) {
    const items = await this.repository.list(tenantId);
    return {
      total: items.length,
      abertos: items.filter((item) => item.status === 'ABERTO').length,
      triagem: items.filter((item) => item.status === 'EM_TRIAGEM').length,
      encaminhados: items.filter((item) => item.status === 'ENCAMINHADO' || item.status === 'EM_CAMPO').length,
      resolvidos: items.filter((item) => item.status === 'RESOLVIDO').length,
      anexos: items.reduce((acc, item) => acc + (item.attachmentKeys?.length ?? 0), 0),
    };
  }
}
