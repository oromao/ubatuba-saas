import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parcel, ParcelDocument } from './parcel.schema';
import { asObjectId } from '../../../common/utils/object-id';

type ParcelFilters = {
  projectId: string;
  sqlu?: string;
  inscription?: string;
  inscricaoImobiliaria?: string;
  status?: string;
  workflowStatus?: string;
  bbox?: string;
  q?: string;
  zoneId?: string;
  faceId?: string;
};

@Injectable()
export class ParcelsRepository {
  constructor(@InjectModel(Parcel.name) private readonly model: Model<ParcelDocument>) {}

  list(tenantId: string, filters: ParcelFilters) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(filters.projectId),
    };
    if (filters.sqlu) query.sqlu = filters.sqlu;
    if (filters.inscription) query.inscription = filters.inscription;
    if (filters.inscricaoImobiliaria) {
      query.inscricaoImobiliaria = filters.inscricaoImobiliaria;
    }
    if (filters.status) query.status = filters.status;
    if (filters.workflowStatus) query.workflowStatus = filters.workflowStatus;
    if (filters.zoneId) query.zoneId = asObjectId(filters.zoneId);
    if (filters.faceId) query.faceId = asObjectId(filters.faceId);

    if (filters.q) {
      const term = filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(term, 'i');
      query.$or = [
        { sqlu: regex },
        { inscription: regex },
        { inscricaoImobiliaria: regex },
        { mainAddress: regex },
        { 'enderecoPrincipal.logradouro': regex },
        { 'enderecoPrincipal.bairro': regex },
        { 'enderecoPrincipal.cidade': regex },
      ];
    }

    if (filters.bbox) {
      const [minLng, minLat, maxLng, maxLat] = filters.bbox.split(',').map(Number);
      query.geometry = {
        $geoWithin: {
          $box: [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
        },
      };
    }

    return this.model.find(query).sort({ sqlu: 1 }).exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  create(data: Partial<Parcel>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<Parcel>) {
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
