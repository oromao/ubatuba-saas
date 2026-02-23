import { Injectable } from '@nestjs/common';
import { FactorSetsRepository } from './factor-sets.repository';
import { ProjectsService } from '../../projects/projects.service';
import { asObjectId } from '../../../common/utils/object-id';
import { UpdateFactorSetDto } from './dto/update-factor-set.dto';

@Injectable()
export class FactorSetsService {
  constructor(
    private readonly repository: FactorSetsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async get(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const existing = await this.repository.findByProject(tenantId, String(resolvedProjectId));
    if (existing) return existing;
    return this.repository.upsert(tenantId, String(resolvedProjectId), {
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      fatoresTerreno: [],
      fatoresConstrucao: [],
      valoresConstrucaoM2: [],
    });
  }

  async update(tenantId: string, dto: UpdateFactorSetDto, userId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    return this.repository.upsert(tenantId, String(resolvedProjectId), {
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      fatoresTerreno: dto.fatoresTerreno ?? [],
      fatoresConstrucao: dto.fatoresConstrucao ?? [],
      valoresConstrucaoM2: dto.valoresConstrucaoM2 ?? [],
      updatedBy: userId ? asObjectId(userId) : undefined,
    });
  }
}
