import { BadRequestException, Injectable } from '@nestjs/common';
import { LogradourosRepository } from './logradouros.repository';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class LogradourosService {
  constructor(
    private readonly repository: LogradourosRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId: string | undefined) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId));
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findById(tenantId, String(resolvedProjectId), id);
  }

  async create(
    tenantId: string,
    projectId: string | undefined,
    dto: CreateLogradouroDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const name = dto.name ?? dto.nome;
    const type = dto.type ?? dto.tipo;
    const code = dto.code ?? dto.codigo;
    if (!name || !type || !code) {
      throw new BadRequestException('Nome, tipo e codigo sao obrigatorios');
    }
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      name,
      nome: dto.nome ?? name,
      type,
      tipo: dto.tipo ?? type,
      code,
      codigo: dto.codigo ?? code,
      geometry: dto.geometry,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateLogradouroDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const name = dto.name ?? dto.nome;
    const type = dto.type ?? dto.tipo;
    const code = dto.code ?? dto.codigo;
    return this.repository.update(tenantId, String(resolvedProjectId), id, {
      name,
      nome: dto.nome ?? name,
      type,
      tipo: dto.tipo ?? type,
      code,
      codigo: dto.codigo ?? code,
      geometry: dto.geometry,
    });
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.delete(tenantId, String(resolvedProjectId), id);
  }
}
