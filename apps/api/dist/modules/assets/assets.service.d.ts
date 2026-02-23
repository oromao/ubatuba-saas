import { CacheService } from '../shared/cache.service';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private readonly assetsRepository;
    private readonly cacheService;
    constructor(assetsRepository: AssetsRepository, cacheService: CacheService);
    list(tenantId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateAssetDto): Promise<import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateAssetDto): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
