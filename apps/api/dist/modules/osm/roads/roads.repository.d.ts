import { Model } from 'mongoose';
import { Road, RoadDocument } from './road.schema';
export declare class RoadsRepository {
    private readonly model;
    constructor(model: Model<RoadDocument>);
    list(tenantId: string, projectId: string, bbox?: string): Promise<(import("mongoose").Document<unknown, {}, RoadDocument, {}, {}> & Road & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    insertMany(data: Partial<Road>[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, RoadDocument, {}, {}> & Road & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, Omit<Partial<Road>[], "_id">>[]>;
}
