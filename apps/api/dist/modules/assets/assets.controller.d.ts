import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    list(req: {
        tenantId: string;
    }, bbox?: string): Promise<import("./asset.schema").AssetDocument[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<import("./asset.schema").AssetDocument | null>;
    create(req: {
        tenantId: string;
    }, dto: CreateAssetDto): Promise<import("./asset.schema").AssetDocument>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateAssetDto): Promise<import("./asset.schema").AssetDocument | null>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
