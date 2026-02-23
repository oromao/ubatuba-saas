import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CacheService } from '../shared/cache.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class ProcessesService {
  constructor(
    private readonly processesRepository: ProcessesRepository,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.processesRepository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.processesRepository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreateProcessDto) {
    const protocolNumber = `PR-${randomUUID().slice(0, 8).toUpperCase()}`;
    const created = await this.processesRepository.create({
      tenantId: asObjectId(tenantId),
      protocolNumber,
      title: dto.title,
      owner: dto.owner,
      status: 'EM_ANALISE',
    });
    await this.processesRepository.addEvent({
      tenantId: asObjectId(tenantId),
      processId: created.id,
      type: 'CREATED',
      message: 'Processo criado',
    });
    await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateProcessDto) {
    const updated = await this.processesRepository.update(tenantId, id, dto);
    await this.cacheService.invalidateByPrefix(`processes:${tenantId}`);
    return updated;
  }

  async transition(tenantId: string, id: string, dto: TransitionDto) {
    const updated = await this.processesRepository.update(tenantId, id, {
      status: dto.status,
    });
    await this.processesRepository.addEvent({
      tenantId: asObjectId(tenantId),
      processId: id,
      type: 'STATUS_CHANGED',
      message: dto.message,
    });
    await this.cacheService.invalidateByPrefix(`dashboard:${tenantId}`);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.processesRepository.delete(tenantId, id);
    await this.cacheService.invalidateByPrefix(`processes:${tenantId}`);
    return { success: true };
  }

  events(tenantId: string, id: string) {
    return this.processesRepository.listEvents(tenantId, id);
  }
}
