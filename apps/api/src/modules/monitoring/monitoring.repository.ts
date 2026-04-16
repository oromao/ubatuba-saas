import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { EnvironmentalEvent, EnvironmentalEventDocument } from './environment-event.schema';

@Injectable()
export class MonitoringRepository {
  constructor(@InjectModel(EnvironmentalEvent.name) private readonly model: Model<EnvironmentalEventDocument>) {}

  list(
    tenantId: string,
    filters?: {
      stage?: string;
      severity?: string;
      type?: string;
      sourceMode?: string;
      assignedTo?: string;
    },
  ) {
    const query: Record<string, unknown> = { tenantId: asObjectId(tenantId) };
    if (filters?.stage) query.stage = filters.stage;
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.type) query.type = filters.type;
    if (filters?.sourceMode) query.sourceMode = filters.sourceMode;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<EnvironmentalEvent>) {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<EnvironmentalEvent>) {
    return this.model.findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true }).exec();
  }
}
