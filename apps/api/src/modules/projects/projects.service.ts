import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  list(tenantId: string) {
    return this.projectsRepository.list(tenantId);
  }

  findById(tenantId: string, id: string) {
    return this.projectsRepository.findById(tenantId, id);
  }

  async resolveProjectId(tenantId: string, projectId?: string) {
    if (projectId) {
      return asObjectId(projectId);
    }
    const existing = await this.projectsRepository.findDefault(tenantId);
    if (existing) {
      return asObjectId(existing.id);
    }
    const created = await this.projectsRepository.create({
      tenantId: asObjectId(tenantId),
      name: 'Projeto Demo',
      slug: 'demo',
      isDefault: true,
    });
    return asObjectId(created.id);
  }

  async create(tenantId: string, dto: CreateProjectDto, userId?: string) {
    return this.projectsRepository.create({
      tenantId: asObjectId(tenantId),
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      defaultCenter: dto.defaultCenter as [number, number] | undefined,
      defaultBbox: dto.defaultBbox as [number, number, number, number] | undefined,
      defaultZoom: dto.defaultZoom,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  update(tenantId: string, id: string, dto: UpdateProjectDto) {
    return this.projectsRepository.update(tenantId, id, {
      name: dto.name,
      description: dto.description,
      defaultCenter: dto.defaultCenter as [number, number] | undefined,
      defaultBbox: dto.defaultBbox as [number, number, number, number] | undefined,
      defaultZoom: dto.defaultZoom,
    });
  }
}
