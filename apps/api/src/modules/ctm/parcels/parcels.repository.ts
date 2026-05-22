import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parcel, ParcelDocument } from './parcel.schema';
import { asObjectId } from '../../../common/utils/object-id';
import { parseBbox, buildGeoIntersectsPolygon } from '../../../common/utils/bbox';

export type ParcelFilters = {
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
  sourceType?: string;
  isOfficial?: boolean;
  zoneamento?: string;
  statusIPTU?: string;
};

@Injectable()
export class ParcelsRepository {
  constructor(@InjectModel(Parcel.name) private readonly model: Model<ParcelDocument>) {}

  list(tenantId: string, filters: ParcelFilters): Promise<ParcelDocument[]> {
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
    if (filters.sourceType) query.sourceType = filters.sourceType;
    if (filters.isOfficial !== undefined) query.isOfficial = filters.isOfficial;
    if (filters.zoneamento) query.zoneamento = filters.zoneamento;
    if (filters.statusIPTU) query.statusIPTU = filters.statusIPTU;

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
      const parsed = parseBbox(filters.bbox);
      query.geometry = buildGeoIntersectsPolygon(parsed.minLng, parsed.minLat, parsed.maxLng, parsed.maxLat);
    }

    const limit = filters.bbox ? 2000 : 0;
    const q = this.model.find(query).sort({ sqlu: 1 });
    if (limit > 0) q.limit(limit);
    return q.exec();
  }

  findById(tenantId: string, projectId: string, id: string): Promise<ParcelDocument | null> {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  findBySqlu(tenantId: string, projectId: string, sqlu: string): Promise<ParcelDocument | null> {
    return this.model
      .findOne({ sqlu, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  findByInscription(tenantId: string, projectId: string, inscription: string): Promise<ParcelDocument | null> {
    return this.model
      .findOne({ 
        $or: [
          { inscricaoImobiliaria: inscription },
          { inscription: inscription },
        ],
        tenantId: asObjectId(tenantId), 
        projectId: asObjectId(projectId) 
      })
      .exec();
  }

  create(data: Partial<Parcel>): Promise<ParcelDocument> {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<Parcel>): Promise<ParcelDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  delete(tenantId: string, projectId: string, id: string): Promise<any> {
    return this.model.deleteOne({
      _id: id,
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    }).exec();
  }
}
