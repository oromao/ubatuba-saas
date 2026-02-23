import { BuildingsService } from './buildings.service';
export declare class ProjectBuildingsController {
    private readonly buildingsService;
    constructor(buildingsService: BuildingsService);
    list(req: {
        tenantId: string;
    }, projectId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./building.schema").BuildingDocument, {}, {}> & import("./building.schema").Building & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(req: {
        tenantId: string;
    }, projectId: string, bbox?: string): Promise<{
        type: "FeatureCollection";
        features: Array<{
            type: "Feature";
            id: string;
            geometry: unknown;
            properties: Record<string, unknown>;
        }>;
    }>;
}
