import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Layer, LayerDocument } from './layer.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class LayersRepository {
  constructor(@InjectModel(Layer.name) private readonly model: Model<LayerDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ order: 1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  update(tenantId: string, id: string, data: Partial<Layer>) {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }
}
