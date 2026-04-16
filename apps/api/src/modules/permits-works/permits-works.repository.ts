import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { PermitWorkRequest, PermitWorkRequestDocument } from './permit-work.schema';

@Injectable()
export class PermitsWorksRepository {
  constructor(@InjectModel(PermitWorkRequest.name) private readonly model: Model<PermitWorkRequestDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<PermitWorkRequest>) {
    return this.model.create(data);
  }

  save(request: PermitWorkRequestDocument) {
    return request.save();
  }
}
