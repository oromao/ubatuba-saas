import { Types } from 'mongoose';
import { ParcelSocioeconomicRepository } from './parcel-socioeconomic.repository';
import { UpsertParcelSocioeconomicDto } from './dto/upsert-parcel-socioeconomic.dto';
import { ProjectsService } from '../../projects/projects.service';
export declare class ParcelSocioeconomicService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: ParcelSocioeconomicRepository, projectsService: ProjectsService);
    findByParcel(tenantId: string, projectId: string | undefined, parcelId: string): Promise<(import("mongoose").Document<unknown, {}, import("./parcel-socioeconomic.schema").ParcelSocioeconomicDocument, {}, {}> & import("./parcel-socioeconomic.schema").ParcelSocioeconomic & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    upsert(tenantId: string, projectId: string | undefined, parcelId: string, dto: UpsertParcelSocioeconomicDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./parcel-socioeconomic.schema").ParcelSocioeconomicDocument, {}, {}> & import("./parcel-socioeconomic.schema").ParcelSocioeconomic & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
