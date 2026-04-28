import { CreateEnvironmentEventDto } from './dto/create-environment-event.dto';
import { UpdateEnvironmentEventDto } from './dto/update-environment-event.dto';
import { MonitoringService } from './monitoring.service';
export declare class MonitoringController {
    private readonly service;
    constructor(service: MonitoringService);
    list(req: {
        tenantId: string;
    }, stage?: string, severity?: string, type?: string, sourceMode?: string, assignedTo?: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    ingest(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateEnvironmentEventDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    get(req: {
        tenantId: string;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    advance(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateEnvironmentEventDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    triage(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateEnvironmentEventDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    assign(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: {
        assignedTo: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    notify(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateEnvironmentEventDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    close(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, id: string, dto: UpdateEnvironmentEventDto): Promise<import("mongoose").Document<unknown, {}, import("./environment-event.schema").EnvironmentalEventDocument, {}, {}> & import("./environment-event.schema").EnvironmentalEvent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    dashboard(req: {
        tenantId: string;
    }, stage?: string, severity?: string, type?: string, sourceMode?: string, assignedTo?: string): Promise<{
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
