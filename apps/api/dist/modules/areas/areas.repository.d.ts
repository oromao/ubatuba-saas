import { Model } from 'mongoose';
import { Area, AreaDocument } from './area.schema';
export declare class AreasRepository {
    private readonly model;
    constructor(model: Model<AreaDocument>);
    list(tenantId: string, group?: string): Promise<(import("mongoose").Document<unknown, {}, AreaDocument, {}, {}> & Area & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
