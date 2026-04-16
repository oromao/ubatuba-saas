import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../../common/utils/object-id';
import { PgvScenario, PgvScenarioDocument } from './pgv-scenario.schema';

@Injectable()
export class PgvScenariosRepository {
  constructor(@InjectModel(PgvScenario.name) private readonly model: Model<PgvScenarioDocument>) {}

  create(data: Partial<PgvScenario>) {
    return this.model.create(data);
  }

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
