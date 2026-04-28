import { ParcelInfrastructureRepository } from './parcel-infrastructure.repository';
import { UpsertParcelInfrastructureDto } from './dto/upsert-parcel-infrastructure.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class ParcelInfrastructureService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: ParcelInfrastructureRepository, projectsService: ProjectsService);
    findByParcel(tenantId: string, projectId: string | undefined, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-infrastructure.schema").ParcelInfrastructureDocument, {}, {}> & import("./parcel-infrastructure.schema").ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string | undefined, parcelId: string, dto: UpsertParcelInfrastructureDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./parcel-infrastructure.schema").ParcelInfrastructureDocument, {}, {}> & import("./parcel-infrastructure.schema").ParcelInfrastructure & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
