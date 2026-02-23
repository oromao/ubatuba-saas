import { ProjectsService } from '../../projects/projects.service';
import { RoadsRepository } from './roads.repository';
type RoadGeoJson = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: unknown;
        properties: Record<string, unknown>;
    }>;
};
export declare class RoadsService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: RoadsRepository, projectsService: ProjectsService);
    list(tenantId: string, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./road.schema").RoadDocument, {}, {}> & import("./road.schema").Road & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(tenantId: string, projectId?: string, bbox?: string): Promise<RoadGeoJson>;
}
export {};
