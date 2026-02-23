import { Model } from 'mongoose';
import { TaxConnector, TaxConnectorDocument } from './tax-connector.schema';
import { TaxSyncLog, TaxSyncLogDocument } from './tax-sync-log.schema';
export declare class TaxIntegrationRepository {
    private readonly connectorModel;
    private readonly logModel;
    constructor(connectorModel: Model<TaxConnectorDocument>, logModel: Model<TaxSyncLogDocument>);
    listConnectors(tenantId: string, projectId: string): Promise<(import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findConnectorById(tenantId: string, projectId: string, connectorId: string): Promise<(import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createConnector(data: Partial<TaxConnector>): Promise<import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateConnector(tenantId: string, projectId: string, connectorId: string, data: Partial<TaxConnector>): Promise<(import("mongoose").Document<unknown, {}, TaxConnectorDocument, {}, {}> & TaxConnector & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createLog(data: Partial<TaxSyncLog>): Promise<import("mongoose").Document<unknown, {}, TaxSyncLogDocument, {}, {}> & TaxSyncLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listLogs(tenantId: string, projectId: string, connectorId: string): Promise<(import("mongoose").Document<unknown, {}, TaxSyncLogDocument, {}, {}> & TaxSyncLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
