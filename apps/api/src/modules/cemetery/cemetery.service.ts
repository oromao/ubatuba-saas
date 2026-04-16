import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DeleteResult } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { CacheService } from '../shared/cache.service';
import { CreateCemeteryPlotDto } from './dto/create-cemetery-plot.dto';
import { UpdateCemeteryPlotDto } from './dto/update-cemetery-plot.dto';
import { CemeteryRepository } from './cemetery.repository';

@Injectable()
export class CemeteryService {
  constructor(
    private readonly repository: CemeteryRepository,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.repository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreateCemeteryPlotDto, actorId?: string) {
    const created = await this.repository.create({
      tenantId: asObjectId(tenantId),
      cemeteryName: dto.cemeteryName,
      block: dto.block,
      row: dto.row,
      plot: dto.plot,
      status: 'LIVRE',
      ownerName: dto.ownerName,
      occupantName: dto.occupantName,
      locationCode: dto.locationCode,
      documentKeys: dto.documentKeys ?? [],
      history: [
        {
          id: randomUUID(),
          status: 'LIVRE',
          message: 'Jazigo cadastrado',
          createdAt: new Date().toISOString(),
          actorId,
        },
      ],
    });
    await this.cacheService.invalidateByPrefix(`cemetery:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateCemeteryPlotDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Jazigo nao encontrado');
    if (dto.ownerName !== undefined) current.ownerName = dto.ownerName;
    if (dto.occupantName !== undefined) current.occupantName = dto.occupantName;
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

  async addDocumentKeys(tenantId: string, id: string, keys: string[], actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Jazigo nao encontrado');
    current.documentKeys = Array.from(new Set([...(current.documentKeys ?? []), ...keys]));
    current.history.unshift({
      id: randomUUID(),
      status: current.status,
      message: `Documentos vinculados (${keys.length})`,
      createdAt: new Date().toISOString(),
      actorId,
    });
    return this.repository.save(current);
  }

  remove(tenantId: string, id: string): Promise<DeleteResult> {
    return this.repository.delete(tenantId, id);
  }

  async summary(tenantId: string) {
    const items = await this.repository.list(tenantId);
    return {
      total: items.length,
      livres: items.filter((item) => item.status === 'LIVRE').length,
      reservados: items.filter((item) => item.status === 'RESERVADO').length,
      ocupados: items.filter((item) => item.status === 'OCUPADO').length,
      manutencao: items.filter((item) => item.status === 'EM_MANUTENCAO').length,
      documentos: items.reduce((acc, item) => acc + (item.documentKeys?.length ?? 0), 0),
    };
  }
}
