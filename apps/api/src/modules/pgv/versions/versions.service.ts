import { Injectable } from '@nestjs/common';
import { VersionsRepository } from './versions.repository';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ProjectsService } from '../../projects/projects.service';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class VersionsService {
  constructor(
    private readonly repository: VersionsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId));
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findById(tenantId, String(resolvedProjectId), id);
  }

  async getActiveOrDefault(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const active = await this.repository.findActive(tenantId, String(resolvedProjectId));
    if (active) return active;
    const created = await this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      name: 'PGV 2026',
      year: 2026,
      isActive: true,
    });
    return created;
  }

  async findByNameOrYear(tenantId: string, projectId: string | undefined, value: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findByNameOrYear(tenantId, String(resolvedProjectId), value);
  }

  async create(tenantId: string, dto: CreateVersionDto, userId?: string) {
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      name: dto.name,
      year: dto.year,
      isActive: false,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateVersionDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    if (dto.isActive) {
      return this.repository.setActive(tenantId, String(resolvedProjectId), id);
    }
    return this.repository.update(tenantId, String(resolvedProjectId), id, dto);
  }
}
