import { Injectable } from '@nestjs/common';
import { ParcelInfrastructureRepository } from './parcel-infrastructure.repository';
import { UpsertParcelInfrastructureDto } from './dto/upsert-parcel-infrastructure.dto';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class ParcelInfrastructureService {
  constructor(
    private readonly repository: ParcelInfrastructureRepository,
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
    dto: UpsertParcelInfrastructureDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const water = dto.water ?? dto.agua;
    const sewage = dto.sewage ?? dto.esgoto;
    const electricity = dto.electricity ?? dto.energia;
    const pavingType = dto.pavingType ?? dto.pavimentacao;
    const publicLighting = dto.publicLighting ?? dto.iluminacao;
    const garbageCollection = dto.garbageCollection ?? dto.coleta;
    return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
      water,
      sewage,
      electricity,
      pavingType,
      publicLighting,
      garbageCollection,
      agua: dto.agua ?? water,
      esgoto: dto.esgoto ?? sewage,
      energia: dto.energia ?? electricity,
      pavimentacao: dto.pavimentacao ?? pavingType,
      iluminacao: dto.iluminacao ?? publicLighting,
      coleta: dto.coleta ?? garbageCollection,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }
}
