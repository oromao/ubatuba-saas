import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvironmentalAlert, EnvironmentalAlertDocument } from './alert.schema';
import { asObjectId } from '../../common/utils/object-id';


@Injectable()
export class AlertsRepository {
  constructor(@InjectModel(EnvironmentalAlert.name) private readonly model: Model<EnvironmentalAlertDocument>) {}

  list(tenantId: string): Promise<EnvironmentalAlertDocument[]> {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string): Promise<EnvironmentalAlertDocument | null> {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<EnvironmentalAlert>): Promise<EnvironmentalAlertDocument> {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<EnvironmentalAlert>): Promise<EnvironmentalAlertDocument | null> {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }

  delete(tenantId: string, id: string): Promise<any> {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }
}
