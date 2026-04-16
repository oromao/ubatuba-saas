import { Document, Types } from 'mongoose';
export type CemeteryPlotStatus = 'LIVRE' | 'RESERVADO' | 'OCUPADO' | 'EM_MANUTENCAO';
export declare class CemeteryPlot {
    tenantId: Types.ObjectId;
    cemeteryName: string;
    block: string;
    row: string;
    plot: string;
    status: CemeteryPlotStatus;
    ownerName?: string;
    occupantName?: string;
    locationCode?: string;
    documentKeys: string[];
    history: Array<{
        id: string;
        status: CemeteryPlotStatus;
        message: string;
        createdAt: string;
        actorId?: string;
    }>;
}
export type CemeteryPlotDocument = CemeteryPlot & Document;
export declare const CemeteryPlotSchema: import("mongoose").Schema<CemeteryPlot, import("mongoose").Model<CemeteryPlot, any, any, any, Document<unknown, any, CemeteryPlot, any, {}> & CemeteryPlot & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CemeteryPlot, Document<unknown, {}, import("mongoose").FlatRecord<CemeteryPlot>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<CemeteryPlot> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
