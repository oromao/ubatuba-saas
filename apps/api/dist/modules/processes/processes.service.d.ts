import { CacheService } from '../shared/cache.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';
export declare class ProcessesService {
    private readonly processesRepository;
    private readonly cacheService;
    constructor(processesRepository: ProcessesRepository, cacheService: CacheService);
    list(tenantId: string): Promise<import("./process.schema").ProcessDocument[]>;
    findById(tenantId: string, id: string): Promise<import("./process.schema").ProcessDocument | null>;
    create(tenantId: string, dto: CreateProcessDto): Promise<import("./process.schema").ProcessDocument>;
    update(tenantId: string, id: string, dto: UpdateProcessDto): Promise<import("./process.schema").ProcessDocument | null>;
    transition(tenantId: string, id: string, dto: TransitionDto): Promise<import("./process.schema").ProcessDocument | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    events(tenantId: string, id: string): Promise<import("./process-event.schema").ProcessEventDocument[]>;
}
