import { Model } from 'mongoose';
import { UrbanFurniture, UrbanFurnitureDocument } from './urban-furniture.schema';
export declare class UrbanFurnitureRepository {
    private readonly model;
    constructor(model: Model<UrbanFurnitureDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<UrbanFurnitureDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<UrbanFurnitureDocument | null>;
    create(data: Partial<UrbanFurniture>): Promise<UrbanFurnitureDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<UrbanFurniture>): Promise<UrbanFurnitureDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
