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
}

