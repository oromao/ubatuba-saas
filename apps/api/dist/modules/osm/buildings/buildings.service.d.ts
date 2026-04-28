import { ProjectsService } from '../../projects/projects.service';
import { BuildingsRepository } from './buildings.repository';
type BuildingGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: unknown;
        properties: Record<string, unknown>;
    }>;
};
export declare class BuildingsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: BuildingsRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./building.schema").BuildingDocument, {}, {}> & import("./building.schema").Building & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(tenantId: string, projectId?: string, bbox?: string): Promise<BuildingGeoJson>;
}
export {};
