import { Document, Types } from 'mongoose';
export type LayerType = 'raster' | 'vector' | 'basemap';
export type LayerSource = 'geoserver' | 'api' | 'external';
export type LayerGeometryType = 'polygon' | 'line' | 'point';
export declare class Layer {
    tenantId: Types.ObjectId;
    name: string;
    group: string;
    type: LayerType;
    source: LayerSource;
    geoserver?: {
        workspace: string;
        layerName: string;
    };
    tileUrl?: string;
    dataUrl?: string;
    opacity: number;
    visible: boolean;
    order: number;
    style?: {
        fillColor?: string;
        lineColor?: string;
        lineWidth?: number;
        labelField?: string;
    };
    geometryType?: LayerGeometryType;
    minZoom?: number;
    maxZoom?: number;
}
export type LayerDocument = Layer & Document;
export declare const LayerSchema: import("mongoose").Schema<Layer, import("mongoose").Model<Layer, any, any, any, Document<unknown, any, Layer, any, {}> & Layer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Layer, Document<unknown, {}, import("mongoose").FlatRecord<Layer>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Layer> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
