import { CacheService } from '../shared/cache.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';
export declare class ProcessesService {
    private readonly processesRepository;
    private readonly cacheService;
    constructor(processesRepository: ProcessesRepository, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateProcessDto): Promise<import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateProcessDto): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    transition(tenantId: string, id: string, dto: TransitionDto): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    events(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./process-event.schema").ProcessEventDocument, {}, {}> & import("./process-event.schema").ProcessEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
