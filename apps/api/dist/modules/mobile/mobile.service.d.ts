import { ParcelsRepository } from '../ctm/parcels/parcels.repository';
import { ProjectsService } from '../projects/projects.service';
import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileRepository } from './mobile.repository';
export declare class MobileService {
    private readonly repository;
    private readonly projectsService;
    private readonly parcelsRepository;
    constructor(repository: MobileRepository, projectsService: ProjectsService, parcelsRepository: ParcelsRepository);
    sync(tenantId: string, dto: MobileSyncDto, actorId?: string): Promise<{
        processed: number;
        failed: {
            clientId?: string;
            status: "PROCESSADO" | "ERRO";
            error?: string;
            evidenceCount: number;
            details?: {
                clientParcelUpdatedAt?: string;
                serverParcelUpdatedAt?: string;
            };
        }[];
        evidenceSummary: {
            processed: number;
            failed: number;
        };
    }>;
    listRecords(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./mobile-field-record.schema").MobileFieldRecordDocument, {}, {}> & import("./mobile-field-record.schema").MobileFieldRecord & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    summary(tenantId: string, projectId?: string): Promise<{
        total: number;
        processado: number;
        conflito: number;
        recebido: number;
        comEvidencias: number;
        evidenciasTotal: number;
        erros: number;
    }>;
}
