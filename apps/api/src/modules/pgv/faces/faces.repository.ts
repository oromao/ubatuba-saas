import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvFace, PgvFaceDocument } from './face.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class FacesRepository {
  constructor(@InjectModel(PgvFace.name) private readonly model: Model<PgvFaceDocument>) {}

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
    return this.model.find(query).sort({ code: 1 }).exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  findByGeometry(tenantId: string, projectId: string, geometry: unknown) {
    return this.model
      .findOne({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        geometry: { $geoIntersects: { $geometry: geometry } },
      })
      .exec();
  }

  create(data: Partial<PgvFace>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<PgvFace>) {
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
