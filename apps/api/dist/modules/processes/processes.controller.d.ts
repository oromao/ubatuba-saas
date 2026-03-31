import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesService } from './processes.service';
export declare class ProcessesController {
    private readonly processesService;
    constructor(processesService: ProcessesService);
    list(req: {
        tenantId: string;
    }): Promise<import("./process.schema").ProcessDocument[]>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<import("./process.schema").ProcessDocument | null>;
    create(req: {
        tenantId: string;
    }, dto: CreateProcessDto): Promise<import("./process.schema").ProcessDocument>;
    update(req: {
        tenantId: string;
    }, id: string, dto: UpdateProcessDto): Promise<import("./process.schema").ProcessDocument | null>;
    transition(req: {
        tenantId: string;
    }, id: string, dto: TransitionDto): Promise<import("./process.schema").ProcessDocument | null>;
    events(req: {
        tenantId: string;
    }, id: string): Promise<import("./process-event.schema").ProcessEventDocument[]>;
    remove(req: {
        tenantId: string;
    }, id: string): Promise<{
        success: boolean;
    }>;
}
