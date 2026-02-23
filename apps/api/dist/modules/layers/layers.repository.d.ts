import { Model } from 'mongoose';
import { Layer, LayerDocument } from './layer.schema';
export declare class LayersRepository {
    private readonly model;
    constructor(model: Model<LayerDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, LayerDocument, {}, {}> & Layer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, LayerDocument, {}, {}> & Layer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    update(tenantId: string, id: string, data: Partial<Layer>): Promise<(import("mongoose").Document<unknown, {}, LayerDocument, {}, {}> & Layer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
