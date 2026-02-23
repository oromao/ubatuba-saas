import { ProjectsService } from '../projects/projects.service';
import { CreateTaxConnectorDto, RunTaxSyncDto, UpdateTaxConnectorDto } from './dto/tax-integration.dto';
import { TaxConnectorDocument } from './tax-connector.schema';
import { TaxIntegrationRepository } from './tax-integration.repository';
type SyncResult = {
    status: 'SUCESSO' | 'ERRO';
    processed: number;
    inserted?: number;
    updated?: number;
    errors?: number;
    message?: string;
};
export declare class TaxIntegrationService {
    private readonly repository;
    private readonly projectsService;
    constructor(repository: TaxIntegrationRepository, projectsService: ProjectsService);
    private resolveProject;
    private parseCsvRows;
    private executeRestSync;
    private executeCsvSync;
    private executeSftpSync;
    private executeSyncByMode;
    listConnectors(tenantId: string, projectId?: string): Promise<(import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createConnector(tenantId: string, dto: CreateTaxConnectorDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateConnector(tenantId: string, projectId: string | undefined, connectorId: string, dto: UpdateTaxConnectorDto): Promise<import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & import("./tax-connector.schema").TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    testConnection(tenantId: string, projectId: string | undefined, connectorId: string, actorId?: string): Promise<SyncResult>;
    runSync(tenantId: string, projectId: string | undefined, connectorId: string, dto: RunTaxSyncDto, actorId?: string): Promise<SyncResult>;
    listLogs(tenantId: string, projectId: string | undefined, connectorId: string): Promise<(import("mongoose").Document<unknown, {}, import("./tax-sync-log.schema").TaxSyncLogDocument, {}, {}> & import("./tax-sync-log.schema").TaxSyncLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
export {};
