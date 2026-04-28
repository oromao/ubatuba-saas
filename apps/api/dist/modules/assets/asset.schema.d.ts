import { Document, Types } from 'mongoose';
export declare class Asset {
    tenantId: Types.ObjectId;
    name: string;
    category: string;
    status: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
}
export type AssetDocument = Asset & Document;
export declare const AssetSchema: import("mongoose").Schema<Asset, import("mongoose").Model<Asset, any, any, any, Document<unknown, any, Asset, any, {}> & Asset & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Asset, Document<unknown, {}, import("mongoose").FlatRecord<Asset>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Asset> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
