import { ProjectsService } from '../projects/projects.service';
import { MobileSyncDto } from './dto/mobile-sync.dto';
import { MobileRepository } from './mobile.repository';
export declare class MobileService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: MobileRepository, projectsService: ProjectsService);
    sync(tenantId: string, dto: MobileSyncDto, actorId?: string): Promise<{
        processed: number;
    }>;
    listRecords(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./mobile-field-record.schema").MobileFieldRecordDocument, {}, {}> & import("./mobile-field-record.schema").MobileFieldRecord & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
