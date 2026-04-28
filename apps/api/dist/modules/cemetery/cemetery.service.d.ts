import { DeleteResult } from 'mongoose';
import { CacheService } from '../shared/cache.service';
import { CreateCemeteryPlotDto } from './dto/create-cemetery-plot.dto';
import { UpdateCemeteryPlotDto } from './dto/update-cemetery-plot.dto';
import { CemeteryRepository } from './cemetery.repository';
export declare class CemeteryService {
    private readonly repository;
    private readonly cacheService;
    constructor(repository: CemeteryRepository, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateCemeteryPlotDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./cemetery.schema").CemeteryPlotDocument, {}, {}> & import("./cemetery.schema").CemeteryPlot & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateCemeteryPlotDto, actorId?: string): Promise<import("./cemetery.schema").CemeteryPlotDocument>;
    addDocumentKeys(tenantId: string, id: string, keys: string[], actorId?: string): Promise<import("./cemetery.schema").CemeteryPlotDocument>;
    remove(tenantId: string, id: string): Promise<DeleteResult>;
    summary(tenantId: string): Promise<{
        total: number;
        livres: number;
        reservados: number;
        ocupados: number;
        manutencao: number;
        documentos: number;
    }>;
}
