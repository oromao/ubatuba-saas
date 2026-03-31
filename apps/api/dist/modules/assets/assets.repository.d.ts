import { Model } from 'mongoose';
import { Asset, AssetDocument } from './asset.schema';
export declare class AssetsRepository {
    private readonly model;
    constructor(model: Model<AssetDocument>);
    list(tenantId: string, bbox?: string): Promise<AssetDocument[]>;
    findById(tenantId: string, id: string): Promise<AssetDocument | null>;
    create(data: Partial<Asset>): Promise<AssetDocument>;
    update(tenantId: string, id: string, data: Partial<Asset>): Promise<AssetDocument | null>;
    delete(tenantId: string, id: string): Promise<any>;
}
