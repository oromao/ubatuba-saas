import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvFactorSet, PgvFactorSetDocument } from './factor-set.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class FactorSetsRepository {
  constructor(@InjectModel(PgvFactorSet.name) private readonly model: Model<PgvFactorSetDocument>) {}

  findByProject(tenantId: string, projectId: string) {
    return this.model
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  upsert(tenantId: string, projectId: string, data: Partial<PgvFactorSet>) {
    return this.model
      .findOneAndUpdate(
        { tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true, upsert: true },
      )
      .exec();
  }
}
