import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvironmentalAlert, EnvironmentalAlertDocument } from './alert.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class AlertsRepository {
  constructor(@InjectModel(EnvironmentalAlert.name) private readonly model: Model<EnvironmentalAlertDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<EnvironmentalAlert>) {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<EnvironmentalAlert>) {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }

  delete(tenantId: string, id: string) {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }
}
