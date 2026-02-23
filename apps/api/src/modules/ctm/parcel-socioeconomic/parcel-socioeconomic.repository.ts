import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParcelSocioeconomic, ParcelSocioeconomicDocument } from './parcel-socioeconomic.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class ParcelSocioeconomicRepository {
  constructor(
    @InjectModel(ParcelSocioeconomic.name)
    private readonly model: Model<ParcelSocioeconomicDocument>,
  ) {}

  findByParcel(tenantId: string, projectId: string, parcelId: string) {
    return this.model
      .findOne({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        parcelId: asObjectId(parcelId),
      })
      .exec();
  }

  upsert(tenantId: string, projectId: string, parcelId: string, data: Partial<ParcelSocioeconomic>) {
    return this.model
      .findOneAndUpdate(
        {
          tenantId: asObjectId(tenantId),
          projectId: asObjectId(projectId),
          parcelId: asObjectId(parcelId),
        },
        data,
        { new: true, upsert: true },
      )
      .exec();
  }
}
