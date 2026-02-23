import { Document, Types } from 'mongoose';
export declare class Area {
    tenantId: Types.ObjectId;
    name: string;
    group: string;
    color: string;
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}
export type AreaDocument = Area & Document;
export declare const AreaSchema: import("mongoose").Schema<Area, import("mongoose").Model<Area, any, any, any, Document<unknown, any, Area, any, {}> & Area & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Area, Document<unknown, {}, import("mongoose").FlatRecord<Area>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Area> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
