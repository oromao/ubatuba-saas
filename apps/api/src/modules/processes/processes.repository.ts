import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Process, ProcessDocument } from './process.schema';
import { ProcessEvent, ProcessEventDocument } from './process-event.schema';
import { asObjectId } from '../../common/utils/object-id';


@Injectable()
export class ProcessesRepository {
  constructor(
    @InjectModel(Process.name) private readonly model: Model<ProcessDocument>,
    @InjectModel(ProcessEvent.name)
    private readonly eventModel: Model<ProcessEventDocument>,
  ) {}

  list(tenantId: string): Promise<ProcessDocument[]> {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string): Promise<ProcessDocument | null> {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<Process>): Promise<ProcessDocument> {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<Process>): Promise<ProcessDocument | null> {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }

  delete(tenantId: string, id: string): Promise<any> {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  addEvent(data: Partial<ProcessEvent>): Promise<ProcessEventDocument> {
    return this.eventModel.create(data);
  }

  listEvents(tenantId: string, processId: string): Promise<ProcessEventDocument[]> {
    return this.eventModel
      .find({ tenantId: asObjectId(tenantId), processId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
