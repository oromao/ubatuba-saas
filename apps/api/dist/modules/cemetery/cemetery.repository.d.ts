import { DeleteResult, Model } from 'mongoose';
import { CemeteryPlot, CemeteryPlotDocument } from './cemetery.schema';
export declare class CemeteryRepository {
    private readonly model;
    constructor(model: Model<CemeteryPlotDocument>);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, CemeteryPlotDocument, {}, {}> & CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, CemeteryPlotDocument, {}, {}> & CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(data: Partial<CemeteryPlot>): Promise<import("mongoose").Document<unknown, {}, CemeteryPlotDocument, {}, {}> & CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    save(plot: CemeteryPlotDocument): Promise<CemeteryPlotDocument>;
    delete(tenantId: string, id: string): Promise<DeleteResult>;
}
