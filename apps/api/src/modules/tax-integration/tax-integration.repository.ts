import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { TaxConnector, TaxConnectorDocument } from './tax-connector.schema';
import { TaxSyncLog, TaxSyncLogDocument } from './tax-sync-log.schema';

@Injectable()
export class TaxIntegrationRepository {
  constructor(
    @InjectModel(TaxConnector.name) private readonly connectorModel: Model<TaxConnectorDocument>,
    @InjectModel(TaxSyncLog.name) private readonly logModel: Model<TaxSyncLogDocument>,
  ) {}

  listConnectors(tenantId: string, projectId: string) {
    return this.connectorModel
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findConnectorById(tenantId: string, projectId: string, connectorId: string) {
    return this.connectorModel
      .findOne({
        _id: connectorId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  createConnector(data: Partial<TaxConnector>) {
    return this.connectorModel.create(data);
  }

  updateConnector(tenantId: string, projectId: string, connectorId: string, data: Partial<TaxConnector>) {
    return this.connectorModel
      .findOneAndUpdate(
        { _id: connectorId, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  createLog(data: Partial<TaxSyncLog>) {
    return this.logModel.create(data);
  }

  listLogs(tenantId: string, projectId: string, connectorId: string) {
    return this.logModel
      .find({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        connectorId: asObjectId(connectorId),
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }
}

