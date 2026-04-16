import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { CemeteryPlot, CemeteryPlotDocument } from './cemetery.schema';

@Injectable()
export class CemeteryRepository {
  constructor(@InjectModel(CemeteryPlot.name) private readonly model: Model<CemeteryPlotDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<CemeteryPlot>) {
    return this.model.create(data);
  }

  save(plot: CemeteryPlotDocument) {
    return plot.save();
  }

  delete(tenantId: string, id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }
}
