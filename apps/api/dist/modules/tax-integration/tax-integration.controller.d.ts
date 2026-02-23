import { CreateTaxConnectorDto, RunTaxSyncDto, UpdateTaxConnectorDto } from './dto/tax-integration.dto';
import { TaxIntegrationService } from './tax-integration.service';
export declare class TaxIntegrationController {
    private readonly service;
    constructor(service: TaxIntegrationService);
    listConnectors(req: {
        tenantId: string;
    }, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./tax-connector.schema").TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createConnector(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, dto: CreateTaxConnectorDto): Promise<import("mongoose").Document<unknown, {}, import("./tax-connector.schema").TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateConnector(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string, dto: UpdateTaxConnectorDto): Promise<import("mongoose").Document<unknown, {}, import("./tax-connector.schema").TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    testConnection(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string): Promise<{
        status: "SUCESSO" | "ERRO";
        processed: number;
        inserted?: number;
        updated?: number;
        errors?: number;
        message?: string;
    }>;
    runSync(req: {
        tenantId: string;
        user?: {
            sub?: string;
        };
    }, projectId: string | undefined, id: string, dto: RunTaxSyncDto): Promise<{
        status: "SUCESSO" | "ERRO";
        processed: number;
        inserted?: number;
        updated?: number;
        errors?: number;
        message?: string;
    }>;
    listLogs(req: {
        tenantId: string;
    }, projectId: string | undefined, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./tax-sync-log.schema").TaxSyncLogDocument, {}, {}> & import("./tax-sync-log.schema").TaxSyncLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
