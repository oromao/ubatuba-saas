import { Injectable } from '@nestjs/common';
import { ParcelSocioeconomicRepository } from './parcel-socioeconomic.repository';
import { UpsertParcelSocioeconomicDto } from './dto/upsert-parcel-socioeconomic.dto';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class ParcelSocioeconomicService {
  constructor(
    private readonly repository: ParcelSocioeconomicRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async findByParcel(tenantId: string, projectId: string | undefined, parcelId: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findByParcel(tenantId, String(resolvedProjectId), parcelId);
  }

  async upsert(
    tenantId: string,
    projectId: string | undefined,
    parcelId: string,
    dto: UpsertParcelSocioeconomicDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const incomeBracket = dto.incomeBracket ?? dto.faixaRenda;
    const residents = dto.residents ?? dto.moradores;
    const vulnerabilityIndicator = dto.vulnerabilityIndicator ?? dto.vulnerabilidade;
    return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
      incomeBracket,
      residents,
      vulnerabilityIndicator,
      faixaRenda: dto.faixaRenda ?? incomeBracket,
      moradores: dto.moradores ?? residents,
      vulnerabilidade: dto.vulnerabilidade ?? vulnerabilityIndicator,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }
}
