import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
export class SurveysRepository {
  constructor(@InjectModel(Survey.name) private readonly model: Model<SurveyDocument>) {}

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(tenantId: string, projectId: string, surveyId: string) {
    return this.model
      .findOne({
        _id: surveyId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  create(data: Partial<Survey>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, surveyId: string, data: Partial<Survey>) {
    return this.model
      .findOneAndUpdate(
        { _id: surveyId, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  save(doc: SurveyDocument) {
    return doc.save();
  }
}

