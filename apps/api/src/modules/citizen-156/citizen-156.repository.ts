import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { CitizenCall, CitizenCallDocument } from './citizen-call.schema';

@Injectable()
export class Citizen156Repository {
  constructor(@InjectModel(CitizenCall.name) private readonly model: Model<CitizenCallDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<CitizenCall>) {
    return this.model.create(data);
  }

  save(doc: CitizenCallDocument) {
    return doc.save();
  }
}
