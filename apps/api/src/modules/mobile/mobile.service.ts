import { Injectable } from '@nestjs/common';
import { asObjectId } from '../../common/utils/object-id';
import { ProjectsService } from '../projects/projects.service';
import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileRepository } from './mobile.repository';

@Injectable()
export class MobileService {
  constructor(
    private readonly repository: MobileRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async sync(tenantId: string, dto: MobileSyncDto, actorId?: string) {
    const resolvedProject = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    let processed = 0;
    for (const item of dto.items) {
      await this.repository.create({
        tenantId: asObjectId(tenantId),
        projectId: resolvedProject,
        parcelId: asObjectId(item.parcelId),
        checklist: item.checklist ?? {},
        location: item.location,
        photoBase64: item.photoBase64,
        syncStatus: 'RECEBIDO',
        syncedBy: actorId ? asObjectId(actorId) : undefined,
      });
      processed += 1;
    }
    return { processed };
  }

  async listRecords(tenantId: string, projectId?: string) {
    const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProject));
  }
}

