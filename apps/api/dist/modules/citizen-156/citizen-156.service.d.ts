import { AlertsService } from '../alerts/alerts.service';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
import { CreateCitizenCallDto } from './dto/create-citizen-call.dto';
import { UpdateCitizenCallDto } from './dto/update-citizen-call.dto';
import { Citizen156Repository } from './citizen-156.repository';
export declare class Citizen156Service {
    private readonly repository;
    private readonly projectsService;
    private readonly alertsService;
    private readonly cacheService;
    constructor(repository: Citizen156Repository, projectsService: ProjectsService, alertsService: AlertsService, cacheService: CacheService);
    list(tenantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    create(tenantId: string, dto: CreateCitizenCallDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(tenantId: string, id: string, dto: UpdateCitizenCallDto, actorId?: string): Promise<import("./citizen-call.schema").CitizenCallDocument>;
    summary(tenantId: string): Promise<{
        total: number;
        abertos: number;
        triagem: number;
        encaminhados: number;
        resolvidos: number;
        anexos: number;
    }>;
    findByProtocol(protocolNumber: string): Promise<(import("mongoose").Document<unknown, {}, import("./citizen-call.schema").CitizenCallDocument, {}, {}> & import("./citizen-call.schema").CitizenCall & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
