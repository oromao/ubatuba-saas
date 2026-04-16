import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImportBatch, ImportBatchDocument } from './import-batch.schema';

@Injectable()
export class ImportBatchRepository {
  constructor(
    @InjectModel(ImportBatch.name)
    private readonly importBatchModel: Model<ImportBatchDocument>,
  ) {}

  async create(data: Partial<ImportBatch>): Promise<ImportBatchDocument> {
    const created = new this.importBatchModel(data);
    return created.save();
  }

  async update(
    id: string,
    data: Partial<ImportBatch>,
  ): Promise<ImportBatchDocument | null> {
    return this.importBatchModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async findById(id: string): Promise<ImportBatchDocument | null> {
    return this.importBatchModel.findById(id).exec();
  }

  async list(
    tenantId: string,
    projectId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<ImportBatchDocument[]> {
    return this.importBatchModel
      .find({ tenantId: new Types.ObjectId(tenantId), projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .skip(options?.skip ?? 0)
      .exec();
  }
}
