import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../../common/utils/object-id';
import { ParcelAuditLog, ParcelAuditLogDocument } from './parcel-audit.schema';

@Injectable()
export class ParcelAuditRepository {
  constructor(@InjectModel(ParcelAuditLog.name) private readonly model: Model<ParcelAuditLogDocument>) {}

  create(data: Partial<ParcelAuditLog>) {
    return this.model.create(data);
  }

  listByParcel(tenantId: string, projectId: string, parcelId: string) {
    return this.model
      .find({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        parcelId: asObjectId(parcelId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  listAll(
    tenantId: string,
    filters: { parcelId?: string; actorId?: string; action?: string; limit?: number; offset?: number },
  ) {
    const query: Record<string, unknown> = { tenantId: asObjectId(tenantId) };
    if (filters.parcelId) query.parcelId = asObjectId(filters.parcelId);
    if (filters.actorId) query.actorId = asObjectId(filters.actorId);
    if (filters.action) query.action = filters.action;
    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filters.offset ?? 0)
      .limit(filters.limit ?? 50)
      .lean()
      .exec();
  }

  countAll(
    tenantId: string,
    filters: { parcelId?: string; actorId?: string; action?: string },
  ) {
    const query: Record<string, unknown> = { tenantId: asObjectId(tenantId) };
    if (filters.parcelId) query.parcelId = asObjectId(filters.parcelId);
    if (filters.actorId) query.actorId = asObjectId(filters.actorId);
    if (filters.action) query.action = filters.action;
    return this.model.countDocuments(query).exec();
  }
}

