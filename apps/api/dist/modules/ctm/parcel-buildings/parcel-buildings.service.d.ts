import { ParcelBuildingsRepository } from './parcel-buildings.repository';
import { UpsertParcelBuildingDto } from './dto/upsert-parcel-building.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class ParcelBuildingsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: ParcelBuildingsRepository, projectsService: ProjectsService);
    findByParcel(tenantId: string, projectId: string | undefined, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-building.schema").ParcelBuildingDocument, {}, {}> & import("./parcel-building.schema").ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string | undefined, parcelId: string, dto: UpsertParcelBuildingDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./parcel-building.schema").ParcelBuildingDocument, {}, {}> & import("./parcel-building.schema").ParcelBuilding & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
