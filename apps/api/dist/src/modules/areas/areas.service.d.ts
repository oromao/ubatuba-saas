import { CacheService } from '../shared/cache.service';
import { AreasRepository } from './areas.repository';
type FeatureCollection = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        id: string;
        geometry: {
            type: 'Polygon';
            coordinates: number[][][];
        };
        properties: Record<string, unknown>;
    }>;
};
export declare class AreasService {
    private readonly areasRepository;
    private readonly cacheService;
    constructor(areasRepository: AreasRepository, cacheService: CacheService);
    list(tenantId: string, group?: string): Promise<FeatureCollection>;
}
export {};
