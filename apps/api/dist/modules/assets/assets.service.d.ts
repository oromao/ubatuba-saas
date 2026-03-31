import { CacheService } from '../shared/cache.service';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private readonly assetsRepository;
    private readonly cacheService;
    constructor(assetsRepository: AssetsRepository, cacheService: CacheService);
    list(tenantId: string, bbox?: string): Promise<import("./asset.schema").AssetDocument[]>;
    findById(tenantId: string, id: string): Promise<import("./asset.schema").AssetDocument | null>;
    create(tenantId: string, dto: CreateAssetDto): Promise<import("./asset.schema").AssetDocument>;
    update(tenantId: string, id: string, dto: UpdateAssetDto): Promise<import("./asset.schema").AssetDocument | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
