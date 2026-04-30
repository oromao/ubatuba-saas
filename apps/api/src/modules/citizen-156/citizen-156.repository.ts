import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { CitizenCall, CitizenCallDocument } from './citizen-call.schema';

@Injectable()
export class Citizen156Repository {
  constructor(@InjectModel(CitizenCall.name) private readonly model: Model<CitizenCallDocument>) {}

  list(tenantId: string) {
    return this.model
      .find({
        $or: [{ tenantId }, { tenantId: asObjectId(tenantId) }],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({
      _id: id,
      $or: [{ tenantId }, { tenantId: asObjectId(tenantId) }],
    }).exec();
  }

  create(data: Partial<CitizenCall>) {
    return this.model.create({
      ...data,
      tenantId: data.tenantId ? asObjectId(String(data.tenantId)) : data.tenantId,
      projectId: data.projectId ? asObjectId(String(data.projectId)) : data.projectId,
    });
  }

  save(doc: CitizenCallDocument) {
    return doc.save();
  }

  findByProtocol(protocolNumber: string) {
    return this.model.findOne({ protocolNumber }).exec();
  }
}
