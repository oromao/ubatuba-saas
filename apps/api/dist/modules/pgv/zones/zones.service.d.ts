import { ZonesRepository } from './zones.repository';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ProjectsService } from '../../projects/projects.service';
type ZoneGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: unknown;
        properties: Record<string, unknown>;
    }>;
};
export declare class ZonesService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: ZonesRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateZoneDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateZoneDto): Promise<(import("mongoose").Document<unknown, {}, import("./zone.schema").PgvZoneDocument, {}, {}> & import("./zone.schema").PgvZone & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, projectId: string | undefined, id: string): Promise<{
        success: boolean;
    }>;
    geojson(tenantId: string, projectId?: string, bbox?: string): Promise<ZoneGeoJson>;
    importGeojson(tenantId: string, projectId: string | undefined, featureCollection: ZoneGeoJson, userId?: string): Promise<{
        inserted: number;
        errors: number;
    }>;
}
export {};
