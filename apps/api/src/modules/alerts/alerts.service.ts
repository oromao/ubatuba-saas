import { Injectable } from '@nestjs/common';
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
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
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
    });
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }

  async resolve(tenantId: string, id: string) {
    const updated = await this.alertsRepository.update(tenantId, id, {
      status: 'RESOLVIDO',
    });
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.alertsRepository.delete(tenantId, id);
    await this.cacheService.invalidateByPrefix(`alerts:${tenantId}`);
    return { success: true };
  }
}
