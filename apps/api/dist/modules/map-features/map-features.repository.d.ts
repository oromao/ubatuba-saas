import { Model } from 'mongoose';
import { MapFeature, MapFeatureDocument, MapFeatureType } from './map-feature.schema';
export declare class MapFeaturesRepository {
    private readonly model;
    constructor(model: Model<MapFeatureDocument>);
    list(tenantId: string, projectId: string, featureType?: MapFeatureType, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, MapFeatureDocument, {}, {}> & MapFeature & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, projectId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, MapFeatureDocument, {}, {}> & MapFeature & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<MapFeature>): Promise<import("mongoose").Document<unknown, {}, MapFeatureDocument, {}, {}> & MapFeature & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, projectId: string, id: string, data: Partial<MapFeature>): Promise<(import("mongoose").Document<unknown, {}, MapFeatureDocument, {}, {}> & MapFeature & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(tenantId: string, projectId: string, id: string): import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, MapFeatureDocument, {}, {}> & MapFeature & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, MapFeatureDocument, "deleteOne", {}>;
}
