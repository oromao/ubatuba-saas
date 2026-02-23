import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvFactor, PgvFactorDocument } from './factor.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class FactorsRepository {
  constructor(@InjectModel(PgvFactor.name) private readonly model: Model<PgvFactorDocument>) {}

  list(tenantId: string, projectId: string, category?: string) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (category) query.category = category;
    return this.model.find(query).sort({ category: 1, key: 1 }).exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  findDefault(tenantId: string, projectId: string, category: string) {
    return this.model
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), category, isDefault: true })
      .exec();
  }

  create(data: Partial<PgvFactor>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<PgvFactor>) {
    return this.model
      .findOneAndUpdate(
        { _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  delete(tenantId: string, projectId: string, id: string) {
    return this.model.deleteOne({
      _id: id,
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    });
  }
}
