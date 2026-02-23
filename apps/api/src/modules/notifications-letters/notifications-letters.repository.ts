import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { LetterBatch, LetterBatchDocument } from './letter-batch.schema';
import { LetterTemplate, LetterTemplateDocument } from './letter-template.schema';

@Injectable()
export class NotificationsLettersRepository {
  constructor(
    @InjectModel(LetterTemplate.name) private readonly templateModel: Model<LetterTemplateDocument>,
    @InjectModel(LetterBatch.name) private readonly batchModel: Model<LetterBatchDocument>,
  ) {}

  listTemplates(tenantId: string, projectId: string) {
    return this.templateModel
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ name: 1, version: -1 })
      .exec();
  }

  findTemplateById(tenantId: string, projectId: string, templateId: string) {
    return this.templateModel
      .findOne({
        _id: templateId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  async getNextTemplateVersion(tenantId: string, projectId: string, name: string) {
    const latest = await this.templateModel
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), name })
      .sort({ version: -1 })
      .exec();
    return (latest?.version ?? 0) + 1;
  }

  createTemplate(data: Partial<LetterTemplate>) {
    return this.templateModel.create(data);
  }

  updateTemplate(tenantId: string, projectId: string, templateId: string, data: Partial<LetterTemplate>) {
    return this.templateModel
      .findOneAndUpdate(
        { _id: templateId, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  createBatch(data: Partial<LetterBatch>) {
    return this.batchModel.create(data);
  }

  listBatches(tenantId: string, projectId: string) {
    return this.batchModel
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findBatchById(tenantId: string, projectId: string, batchId: string) {
    return this.batchModel
      .findOne({
        _id: batchId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  saveBatch(batch: LetterBatchDocument) {
    return batch.save();
  }
}

