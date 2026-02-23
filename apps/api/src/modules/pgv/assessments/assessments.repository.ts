import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvAssessment, PgvAssessmentDocument } from './assessment.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class AssessmentsRepository {
  constructor(@InjectModel(PgvAssessment.name) private readonly model: Model<PgvAssessmentDocument>) {}

  create(data: Partial<PgvAssessment>) {
    return this.model.create(data);
  }

  upsertByParcelAndVersion(
    tenantId: string,
    projectId: string,
    parcelId: string,
    versao: string,
    data: Partial<PgvAssessment>,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          tenantId: asObjectId(tenantId),
          projectId: asObjectId(projectId),
          parcelId: asObjectId(parcelId),
          versao,
        },
        {
          $set: data,
          $setOnInsert: {
            tenantId: asObjectId(tenantId),
            projectId: asObjectId(projectId),
            parcelId: asObjectId(parcelId),
            versao,
          },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  findByParcel(tenantId: string, projectId: string, parcelId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), parcelId: asObjectId(parcelId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
