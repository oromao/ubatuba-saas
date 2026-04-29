import { AreasService } from './areas.service';
export declare class AreasController {
    private readonly areasService;
    constructor(areasService: AreasService);
    list(req: {
        tenantId: string;
    }, group?: string): Promise<{
        type: "FeatureCollection";
        features: Array<{
            type: "Feature";
            id: string;
            geometry: {
                type: "Polygon";
                coordinates: number[][][];
            };
            properties: Record<string, unknown>;
        }>;
    }>;
}
