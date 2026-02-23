import { BadRequestException, Injectable } from '@nestjs/common';
import { UrbanFurnitureRepository } from './urban-furniture.repository';
import { CreateUrbanFurnitureDto } from './dto/create-urban-furniture.dto';
import { UpdateUrbanFurnitureDto } from './dto/update-urban-furniture.dto';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class UrbanFurnitureService {
  constructor(
    private readonly repository: UrbanFurnitureRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId: string | undefined, bbox?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId), bbox);
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findById(tenantId, String(resolvedProjectId), id);
  }

  async create(
    tenantId: string,
    projectId: string | undefined,
    dto: CreateUrbanFurnitureDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const type = dto.type ?? dto.tipo;
    if (!type) {
      throw new BadRequestException('Tipo de mobiliario obrigatorio');
    }
    const condition = dto.condition ?? dto.estadoConservacao;
    const notes = dto.notes ?? dto.observacao;
    const photoUrl = dto.photoUrl ?? dto.fotoUrl;
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      type,
      tipo: dto.tipo ?? type,
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
      geometry: { type: 'Point', coordinates: [dto.lng, dto.lat] },
      condition,
      estadoConservacao: dto.estadoConservacao ?? condition,
      notes,
      observacao: dto.observacao ?? notes,
      photoUrl,
      fotoUrl: dto.fotoUrl ?? photoUrl,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateUrbanFurnitureDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const type = dto.type ?? dto.tipo;
    const condition = dto.condition ?? dto.estadoConservacao;
    const notes = dto.notes ?? dto.observacao;
    const photoUrl = dto.photoUrl ?? dto.fotoUrl;
    const update: Partial<{
      type?: string;
      tipo?: string;
      location?: { type: 'Point'; coordinates: [number, number] };
      geometry?: { type: 'Point'; coordinates: [number, number] };
      condition?: string;
      estadoConservacao?: string;
      notes?: string;
      observacao?: string;
      photoUrl?: string;
      fotoUrl?: string;
    }> = {};
    if (type !== undefined) {
      update.type = type;
      update.tipo = dto.tipo ?? type;
    }
    if (condition !== undefined) {
      update.condition = condition;
      update.estadoConservacao = dto.estadoConservacao ?? condition;
    }
    if (notes !== undefined) {
      update.notes = notes;
      update.observacao = dto.observacao ?? notes;
    }
    if (photoUrl !== undefined) {
      update.photoUrl = photoUrl;
      update.fotoUrl = dto.fotoUrl ?? photoUrl;
    }
    if (dto.lat !== undefined && dto.lng !== undefined) {
      update.location = { type: 'Point', coordinates: [dto.lng, dto.lat] };
      update.geometry = { type: 'Point', coordinates: [dto.lng, dto.lat] };
    }
    return this.repository.update(tenantId, String(resolvedProjectId), id, update);
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.delete(tenantId, String(resolvedProjectId), id);
  }
}
