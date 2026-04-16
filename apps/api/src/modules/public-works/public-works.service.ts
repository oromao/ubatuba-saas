import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DeleteResult } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { asObjectId } from '../../common/utils/object-id';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddMeasurementDto } from './dto/add-measurement.dto';
import { AdvancePublicWorkDto } from './dto/advance-public-work.dto';
import { CreatePublicWorkDto } from './dto/create-public-work.dto';
import { UpdatePublicWorkDto } from './dto/update-public-work.dto';
import { PublicWorksRepository } from './public-works.repository';

@Injectable()
export class PublicWorksService {
  constructor(
    private readonly repository: PublicWorksRepository,
    private readonly projectsService: ProjectsService,
    private readonly cacheService: CacheService,
  ) {}

  list(tenantId: string) {
    return this.repository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.repository.findById(tenantId, id);
  }

  async create(tenantId: string, dto: CreatePublicWorkDto, actorId?: string) {
    const projectId = await this.projectsService.resolveProjectId(tenantId);
    const protocolNumber = `OP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const created = await this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      protocolNumber,
      title: dto.title,
      department: dto.department,
      location: dto.location,
      contractor: dto.contractor,
      budget: dto.budget,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'PLANEJADA',
      stage: 'CADASTRO',
      progress: 0,
      evidenceKeys: [],
      measurements: [],
      history: [
        {
          id: randomUUID(),
          status: 'PLANEJADA',
          stage: 'CADASTRO',
          message: 'Obra publica cadastrada',
          createdAt: new Date().toISOString(),
          actorId,
        },
      ],
    });
    await this.cacheService.invalidateByPrefix(`public-works:${tenantId}`);
    return created;
  }

  async update(tenantId: string, id: string, dto: UpdatePublicWorkDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Obra nao encontrada');
    if (dto.contractor) current.contractor = dto.contractor;
    if (dto.status) {
      current.status = dto.status;
      current.history.unshift({
        id: randomUUID(),
        status: dto.status,
        stage: current.stage,
        message: dto.message ?? `Status alterado para ${dto.status}`,
        createdAt: new Date().toISOString(),
        actorId,
      });
    }
    return this.repository.save(current);
  }

  async advanceStage(tenantId: string, id: string, dto: AdvancePublicWorkDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Obra nao encontrada');
    current.stage = dto.stage;
    if (dto.stage === 'EXECUCAO') current.status = 'EM_EXECUCAO';
    if (dto.stage === 'MEDICAO') current.status = 'CONTRATADA';
    if (dto.stage === 'ENTREGA') current.status = 'CONCLUIDA';
    current.history.unshift({
      id: randomUUID(),
      status: current.status,
      stage: dto.stage,
      message: dto.message ?? `Etapa alterada para ${dto.stage}`,
      createdAt: new Date().toISOString(),
      actorId,
    });
    return this.repository.save(current);
  }

  async addMeasurement(tenantId: string, id: string, dto: AddMeasurementDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Obra nao encontrada');
    current.measurements.unshift({
      id: randomUUID(),
      label: dto.label,
      quantity: dto.quantity,
      unit: dto.unit,
      createdAt: new Date().toISOString(),
      actorId,
    });
    current.progress = Math.min(100, current.progress + 10);
    current.stage = 'MEDICAO';
    current.history.unshift({
      id: randomUUID(),
      status: current.status,
      stage: 'MEDICAO',
      message: dto.message ?? `Medição registrada: ${dto.label}`,
      createdAt: new Date().toISOString(),
      actorId,
    });
    return this.repository.save(current);
  }

  async addEvidence(tenantId: string, id: string, dto: AddEvidenceDto, actorId?: string) {
    const current = await this.repository.findById(tenantId, id);
    if (!current) throw new NotFoundException('Obra nao encontrada');
    current.evidenceKeys = Array.from(new Set([...(current.evidenceKeys ?? []), ...dto.keys]));
    current.stage = 'FISCALIZACAO';
    current.history.unshift({
      id: randomUUID(),
      status: current.status,
      stage: 'FISCALIZACAO',
      message: dto.message ?? `Evidencias anexadas (${dto.keys.length})`,
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
      planejadas: items.filter((item) => item.status === 'PLANEJADA').length,
      execucao: items.filter((item) => item.status === 'EM_EXECUCAO').length,
      contratadas: items.filter((item) => item.status === 'CONTRATADA').length,
      concluidas: items.filter((item) => item.status === 'CONCLUIDA').length,
      progressoMedio: items.length
        ? items.reduce((acc, item) => acc + Number(item.progress ?? 0), 0) / items.length
        : 0,
      medicoes: items.reduce((acc, item) => acc + (item.measurements?.length ?? 0), 0),
      evidencias: items.reduce((acc, item) => acc + (item.evidenceKeys?.length ?? 0), 0),
    };
  }
}
