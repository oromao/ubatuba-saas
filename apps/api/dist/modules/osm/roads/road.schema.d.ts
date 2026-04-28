import { Document, Types } from 'mongoose';
export declare class Road {
    tenantId: Types.ObjectId;
    projectId: Types.ObjectId;
    osmId: number;
    name?: string;
    nome?: string;
    highway?: string;
    tipo?: string;
    geometry: {
        type: 'LineString' | 'MultiLineString';
        coordinates: number[][] | number[][][];
    };
}
export type RoadDocument = Road & Document;
export declare const RoadSchema: import("mongoose").Schema<Road, import("mongoose").Model<Road, any, any, any, Document<unknown, any, Road, any, {}> & Road & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Road, Document<unknown, {}, import("mongoose").FlatRecord<Road>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Road> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
