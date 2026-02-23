import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Road, RoadDocument } from './road.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class RoadsRepository {
  constructor(@InjectModel(Road.name) private readonly model: Model<RoadDocument>) {}

  list(tenantId: string, projectId: string, bbox?: string) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      query.geometry = {
        $geoIntersects: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [minLng, minLat],
                [maxLng, minLat],
                [maxLng, maxLat],
                [minLng, maxLat],
                [minLng, minLat],
              ],
            ],
          },
        },
      };
    }
    return this.model.find(query).exec();
  }

  insertMany(data: Partial<Road>[]) {
    return this.model.insertMany(data, { ordered: false });
  }
}
