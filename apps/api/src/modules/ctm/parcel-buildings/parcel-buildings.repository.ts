import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParcelBuilding, ParcelBuildingDocument } from './parcel-building.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class ParcelBuildingsRepository {
  constructor(
    @InjectModel(ParcelBuilding.name) private readonly model: Model<ParcelBuildingDocument>,
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

  upsert(tenantId: string, projectId: string, parcelId: string, data: Partial<ParcelBuilding>) {
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
