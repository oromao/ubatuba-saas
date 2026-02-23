import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Building, BuildingDocument } from './building.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class BuildingsRepository {
  constructor(@InjectModel(Building.name) private readonly model: Model<BuildingDocument>) {}

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

  insertMany(data: Partial<Building>[]) {
    return this.model.insertMany(data, { ordered: false });
  }
}
