import { Document, Types } from 'mongoose';
export declare class EnvironmentalAlert {
    tenantId: Types.ObjectId;
    title: string;
    level: string;
    status: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
}
export type EnvironmentalAlertDocument = EnvironmentalAlert & Document;
export declare const EnvironmentalAlertSchema: import("mongoose").Schema<EnvironmentalAlert, import("mongoose").Model<EnvironmentalAlert, any, any, any, Document<unknown, any, EnvironmentalAlert, any, {}> & EnvironmentalAlert & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnvironmentalAlert, Document<unknown, {}, import("mongoose").FlatRecord<EnvironmentalAlert>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<EnvironmentalAlert> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
