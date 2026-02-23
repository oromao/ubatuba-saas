import { RoadsService } from './roads.service';
export declare class RoadsController {
    private readonly roadsService;
    constructor(roadsService: RoadsService);
    list(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./road.schema").RoadDocument, {}, {}> & import("./road.schema").Road & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    geojson(req: {
        tenantId: string;
    }, projectId?: string, bbox?: string): Promise<{
        type: "FeatureCollection";
        features: Array<{
            type: "Feature";
            id: string;
            geometry: unknown;
            properties: Record<string, unknown>;
        }>;
    }>;
}
