import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { EnvironmentCase, EnvironmentCaseDocument } from './environment-case.schema';

@Injectable()
export class EnvironmentRepository {
  constructor(@InjectModel(EnvironmentCase.name) private readonly model: Model<EnvironmentCaseDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<EnvironmentCase>) {
    return this.model.create(data);
  }

  save(doc: EnvironmentCaseDocument) {
    return doc.save();
  }
}
