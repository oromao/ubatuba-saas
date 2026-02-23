import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesService } from './processes.service';
export declare class ProcessesController {
    private readonly processesService;
    constructor(processesService: ProcessesService);
    list(req: {
        tenantId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(req: {
        tenantId: string;
    }, dto: CreateProcessDto): Promise<import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateProcessDto): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    transition(req: {
        tenantId: string;
    }, id: string, dto: TransitionDto): Promise<(import("mongoose").Document<unknown, {}, import("./process.schema").ProcessDocument, {}, {}> & import("./process.schema").Process & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    events(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./process-event.schema").ProcessEventDocument, {}, {}> & import("./process-event.schema").ProcessEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
