import { AlertsService } from '../alerts/alerts.service';
import { CacheService } from '../shared/cache.service';
import { CreateEnvironmentEventDto } from './dto/create-environment-event.dto';
import { UpdateEnvironmentEventDto } from './dto/update-environment-event.dto';
import { MonitoringRepository } from './monitoring.repository';
export declare class MonitoringService {
    private readonly repository;
    private readonly alertsService;
    private readonly cacheService;
    private readonly transitionMap;
    constructor(repository: MonitoringRepository, alertsService: AlertsService, cacheService: CacheService);
    list(tenantId: string, filters?: {
        stage?: string;
        severity?: string;
        type?: string;
        sourceMode?: string;
        assignedTo?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findById(tenantId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    ingest(tenantId: string, dto: CreateEnvironmentEventDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private ensureTransition;
    advance(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    triage(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    assign(tenantId: string, id: string, assignedTo: string, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    notify(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    close(tenantId: string, id: string, dto: UpdateEnvironmentEventDto, actorId?: string): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    dashboard(tenantId: string, filters?: {
        stage?: string;
        severity?: string;
        type?: string;
        sourceMode?: string;
        assignedTo?: string;
    }): Promise<{
        total: number;
        triagem: number;
        fiscalizacao: number;
        notificacao: number;
        desfecho: number;
        criticidadeAlta: number;
        comEvidencia: number;
        semAtribuicao: number;
        notificados: number;
        sourceBreakdown: {
            source: string;
            total: number;
        }[];
        typeBreakdown: {
            type: string;
            total: number;
        }[];
        sourceModeBreakdown: {
            sourceMode: string;
            total: number;
        }[];
        feedAdapters: {
            adapter: string;
            mode: string;
            status: string;
        }[];
        recentTimeline: {
            id: any;
            title: string;
            stage: "TRIAGEM" | "FISCALIZACAO" | "EVIDENCIA" | "NOTIFICACAO" | "DESFECHO" | "INGESTAO";
            severity: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
            source: string;
            resolvedAt: string | null;
        }[];
    }>;
}
