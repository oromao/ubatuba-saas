import { Model } from 'mongoose';
import { MapFeature, MapFeatureDocument, MapFeatureType } from './map-feature.schema';
export declare class MapFeaturesRepository {
    private readonly model;
    constructor(model: Model<MapFeatureDocument>);
    list(tenantId: string, projectId: string, featureType?: MapFeatureType, bbox?: string): Promise<MapFeatureDocument[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<MapFeatureDocument | null>;
    create(data: Partial<MapFeature>): Promise<MapFeatureDocument>;
    update(tenantId: string, projectId: string, id: string, data: Partial<MapFeature>): Promise<MapFeatureDocument | null>;
    delete(tenantId: string, projectId: string, id: string): Promise<any>;
}
