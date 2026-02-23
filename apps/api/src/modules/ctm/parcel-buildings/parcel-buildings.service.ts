import { Injectable } from '@nestjs/common';
import { ParcelBuildingsRepository } from './parcel-buildings.repository';
import { UpsertParcelBuildingDto } from './dto/upsert-parcel-building.dto';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class ParcelBuildingsService {
  constructor(
    private readonly repository: ParcelBuildingsRepository,
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
    dto: UpsertParcelBuildingDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const useType = dto.useType ?? dto.uso;
    const constructionStandard = dto.constructionStandard ?? dto.padraoConstrutivo;
    const builtArea = dto.builtArea ?? dto.areaConstruida;
    const floors = dto.floors ?? dto.pavimentos;
    const constructionYear = dto.constructionYear ?? dto.anoConstrucao;
    const occupancyType = dto.occupancyType ?? dto.tipoOcupacao;
    return this.repository.upsert(tenantId, String(resolvedProjectId), parcelId, {
      useType,
      constructionStandard,
      builtArea,
      floors,
      constructionYear,
      occupancyType,
      uso: dto.uso ?? useType,
      padraoConstrutivo: dto.padraoConstrutivo ?? constructionStandard,
      areaConstruida: dto.areaConstruida ?? builtArea,
      pavimentos: dto.pavimentos ?? floors,
      anoConstrucao: dto.anoConstrucao ?? constructionYear,
      tipoOcupacao: dto.tipoOcupacao ?? occupancyType,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }
}
