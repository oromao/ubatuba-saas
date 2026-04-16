import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { asObjectId } from '../../common/utils/object-id';
import { ParcelsRepository } from '../ctm/parcels/parcels.repository';
import { ProjectsService } from '../projects/projects.service';
import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileRepository } from './mobile.repository';

@Injectable()
export class MobileService {
  constructor(
    private readonly repository: MobileRepository,
    private readonly projectsService: ProjectsService,
    private readonly parcelsRepository: ParcelsRepository,
  ) {}

  async sync(tenantId: string, dto: MobileSyncDto, actorId?: string) {
    const resolvedProject = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const results: Array<{
      clientId?: string;
      status: 'PROCESSADO' | 'ERRO';
      error?: string;
      evidenceCount: number;
      details?: { clientParcelUpdatedAt?: string; serverParcelUpdatedAt?: string };
    }> = [];
    let evidencesProcessed = 0;
    let evidencesFailed = 0;
    for (const item of dto.items) {
      try {
        const currentParcel = await this.parcelsRepository.findById(tenantId, String(resolvedProject), item.parcelId);
        const clientParcelUpdatedAt = item.parcelUpdatedAt ? new Date(item.parcelUpdatedAt).getTime() : null;
        const serverParcelUpdatedAt = (currentParcel as any)?.updatedAt
          ? new Date((currentParcel as any).updatedAt as string).getTime()
          : null;
        if (
          currentParcel &&
          clientParcelUpdatedAt &&
          serverParcelUpdatedAt &&
          serverParcelUpdatedAt > clientParcelUpdatedAt
        ) {
          const conflictEvidences = (item.evidences ?? []).map((evidence) => ({
            ...evidence,
            status: 'ERRO' as const,
            retries: (evidence.retries ?? 0) + 1,
            lastError: 'CONFLITO_DE_VERSAO_CADASTRAL',
            lastAttemptAt: new Date().toISOString(),
          }));
          evidencesFailed += conflictEvidences.length;
          await this.repository.create({
            tenantId: asObjectId(tenantId),
            projectId: resolvedProject,
            parcelId: asObjectId(item.parcelId),
            clientId: item.clientId,
            checklist: item.checklist ?? {},
            location: item.location,
            photoBase64: item.photoBase64,
            parcelUpdatedAt: item.parcelUpdatedAt,
            evidences: conflictEvidences,
            syncStatus: 'CONFLITO',
            syncAttempts: 1,
            syncError: 'Registro local desatualizado em relacao ao cadastro atual',
            syncContext: {
              clientParcelUpdatedAt: item.parcelUpdatedAt,
              serverParcelUpdatedAt: (currentParcel as any)?.updatedAt,
            },
            syncTimeline: [
              {
                at: new Date().toISOString(),
                status: 'CONFLITO',
                message: 'Conflito de versao cadastral identificado durante sincronizacao',
                actorId,
              },
            ],
            syncedBy: actorId ? asObjectId(actorId) : undefined,
          });
          results.push({
            clientId: item.clientId,
            status: 'ERRO',
            error: 'CONFLITO_DE_VERSAO_CADASTRAL',
            evidenceCount: conflictEvidences.length,
            details: {
              clientParcelUpdatedAt: item.parcelUpdatedAt,
              serverParcelUpdatedAt: (currentParcel as any)?.updatedAt,
            },
          });
          continue;
        }
        const normalizedEvidences = (item.evidences ?? []).map((evidence) => ({
          ...evidence,
          checksum: evidence.checksum ?? createHash('sha256').update(evidence.base64).digest('hex'),
          capturedAt: evidence.capturedAt ?? new Date().toISOString(),
          size: evidence.size ?? evidence.base64.length,
          status: evidence.status ?? 'SINCRONIZADO',
          retries: evidence.retries ?? 0,
          lastAttemptAt: evidence.lastAttemptAt ?? new Date().toISOString(),
        }));
        await this.repository.create({
          tenantId: asObjectId(tenantId),
          projectId: resolvedProject,
          parcelId: asObjectId(item.parcelId),
          clientId: item.clientId,
          checklist: item.checklist ?? {},
          location: item.location,
          photoBase64: item.photoBase64,
          parcelUpdatedAt: item.parcelUpdatedAt,
          evidences: normalizedEvidences,
          syncStatus: 'PROCESSADO',
          syncAttempts: 1,
          syncedAt: new Date().toISOString(),
          syncTimeline: [
            {
              at: new Date().toISOString(),
              status: 'PROCESSADO',
              message: 'Registro de campo sincronizado com sucesso',
              actorId,
            },
          ],
          syncedBy: actorId ? asObjectId(actorId) : undefined,
        });
        evidencesProcessed += normalizedEvidences.length;
        results.push({ clientId: item.clientId, status: 'PROCESSADO', evidenceCount: normalizedEvidences.length });
      } catch (error) {
        const evidenceCount = item.evidences?.length ?? 0;
        evidencesFailed += evidenceCount;
        results.push({
          clientId: item.clientId,
          status: 'ERRO',
          error: error instanceof Error ? error.message : 'Falha ao persistir',
          evidenceCount,
        });
      }
    }
    return {
      processed: results.filter((item) => item.status === 'PROCESSADO').length,
      failed: results.filter((item) => item.status === 'ERRO'),
      evidenceSummary: {
        processed: evidencesProcessed,
        failed: evidencesFailed,
      },
    };
  }

  async listRecords(tenantId: string, projectId?: string) {
    const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProject));
  }

  async summary(tenantId: string, projectId?: string) {
    const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.summary(tenantId, String(resolvedProject));
  }
}
