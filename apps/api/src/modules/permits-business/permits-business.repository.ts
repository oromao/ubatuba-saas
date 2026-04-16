import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { PermitBusinessRequest, PermitBusinessRequestDocument } from './permit-business.schema';

@Injectable()
export class PermitsBusinessRepository {
  constructor(@InjectModel(PermitBusinessRequest.name) private readonly model: Model<PermitBusinessRequestDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<PermitBusinessRequest>) {
    return this.model.create(data);
  }

  save(doc: PermitBusinessRequestDocument) {
    return doc.save();
  }
}
