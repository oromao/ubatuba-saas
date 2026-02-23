import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './asset.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class AssetsRepository {
  constructor(@InjectModel(Asset.name) private readonly model: Model<AssetDocument>) {}

  list(tenantId: string, bbox?: string) {
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      return this.model
        .find({
          tenantId: asObjectId(tenantId),
          location: {
            $geoWithin: {
              $box: [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
            },
          },
        })
        .exec();
    }
    return this.model.find({ tenantId: asObjectId(tenantId) }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  create(data: Partial<Asset>) {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<Asset>) {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }

  delete(tenantId: string, id: string) {
    return this.model.deleteOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }
}
