import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    list(req: {
        tenantId: string;
    }, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
    }, dto: CreateAssetDto): Promise<import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateAssetDto): Promise<(import("mongoose").Document<unknown, {}, import("./asset.schema").AssetDocument, {}, {}> & import("./asset.schema").Asset & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
