import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvValuation, PgvValuationDocument } from './valuation.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class ValuationsRepository {
  constructor(@InjectModel(PgvValuation.name) private readonly model: Model<PgvValuationDocument>) {}

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByParcel(tenantId: string, projectId: string, parcelId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), parcelId: asObjectId(parcelId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findLatestByParcel(tenantId: string, projectId: string, parcelId: string) {
    return this.model
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), parcelId: asObjectId(parcelId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  listByVersion(tenantId: string, projectId: string, versionId: string) {
    return this.model
      .find({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        versionId: asObjectId(versionId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  create(data: Partial<PgvValuation>) {
    return this.model.create(data);
  }
}
