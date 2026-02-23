import { Injectable } from '@nestjs/common';
import { FactorsRepository } from './factors.repository';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
import { ProjectsService } from '../../projects/projects.service';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class FactorsService {
  constructor(
    private readonly repository: FactorsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId?: string, category?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId), category);
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findById(tenantId, String(resolvedProjectId), id);
  }

  async create(tenantId: string, dto: CreateFactorDto, userId?: string) {
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const existingDefault = await this.repository.findDefault(
      tenantId,
      String(projectId),
      dto.category,
    );
    const shouldBeDefault = dto.isDefault ?? !existingDefault;
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      category: dto.category,
      key: dto.key,
      label: dto.label,
      value: dto.value,
      description: dto.description,
      isDefault: shouldBeDefault,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateFactorDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.update(tenantId, String(resolvedProjectId), id, dto);
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    await this.repository.delete(tenantId, String(resolvedProjectId), id);
    return { success: true };
  }
}
