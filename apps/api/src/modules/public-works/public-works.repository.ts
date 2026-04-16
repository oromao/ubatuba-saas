import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { PublicWork, PublicWorkDocument } from './public-work.schema';

@Injectable()
export class PublicWorksRepository {
  constructor(@InjectModel(PublicWork.name) private readonly model: Model<PublicWorkDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<PublicWork>) {
    return this.model.create(data);
  }

  save(work: PublicWorkDocument) {
    return work.save();
  }

  delete(tenantId: string, id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }
}
