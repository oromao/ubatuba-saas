import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logradouro, LogradouroDocument } from './logradouro.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class LogradourosRepository {
  constructor(@InjectModel(Logradouro.name) private readonly model: Model<LogradouroDocument>) {}

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ name: 1 })
      .exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  create(data: Partial<Logradouro>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<Logradouro>) {
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
