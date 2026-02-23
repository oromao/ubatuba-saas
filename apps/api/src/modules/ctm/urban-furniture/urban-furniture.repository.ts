import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UrbanFurniture, UrbanFurnitureDocument } from './urban-furniture.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class UrbanFurnitureRepository {
  constructor(
    @InjectModel(UrbanFurniture.name) private readonly model: Model<UrbanFurnitureDocument>,
  ) {}

  list(tenantId: string, projectId: string, bbox?: string) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      query.location = {
        $geoWithin: {
          $box: [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
        },
      };
    }
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  create(data: Partial<UrbanFurniture>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<UrbanFurniture>) {
    return this.model
      .findOneAndUpdate(
        { _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  delete(tenantId: string, projectId: string, id: string) {
    return this.model.deleteOne({
      _id: id,
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    });
  }
}
