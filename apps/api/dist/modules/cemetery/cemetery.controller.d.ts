import { DeleteResult } from 'mongoose';
import { CreateCemeteryPlotDto } from './dto/create-cemetery-plot.dto';
import { UpdateCemeteryPlotDto } from './dto/update-cemetery-plot.dto';
import { CemeteryService } from './cemetery.service';
export declare class CemeteryController {
    private readonly service;
    constructor(service: CemeteryService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    summary(req: {
        tenantId: string;
    }): Promise<{
        total: number;
        livres: number;
        reservados: number;
        ocupados: number;
        manutencao: number;
        documentos: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateCemeteryPlotDto): Promise<import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateCemeteryPlotDto): Promise<import("./cemetery.schema").CemeteryPlotDocument>;
    addDocuments(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        keys: string[];
    }): Promise<import("./cemetery.schema").CemeteryPlotDocument>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<DeleteResult>;
}
