import { Document, Types } from 'mongoose';
import { PolygonGeometry } from '../../common/utils/geo';
export type MapFeatureType = 'parcel' | 'building';
export declare class MapFeature {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    tenantSlug?: string;
    projectSlug?: string;
    featureType: MapFeatureType;
    properties?: Record<string, unknown>;
    geometry: PolygonGeometry;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}
export type MapFeatureDocument = MapFeature & Document;
export declare const MapFeatureSchema: import("mongoose").Schema<MapFeature, import("mongoose").Model<MapFeature, any, any, any, Document<unknown, any, MapFeature, any, {}> & MapFeature & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MapFeature, Document<unknown, {}, import("mongoose").FlatRecord<MapFeature>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<MapFeature> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
