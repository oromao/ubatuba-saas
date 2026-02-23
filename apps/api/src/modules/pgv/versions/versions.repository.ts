import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PgvVersion, PgvVersionDocument } from './version.schema';
import { asObjectId } from '../../../common/utils/object-id';

@Injectable()
export class VersionsRepository {
  constructor(@InjectModel(PgvVersion.name) private readonly model: Model<PgvVersionDocument>) {}

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ year: -1 })
      .exec();
  }

  findById(tenantId: string, projectId: string, id: string) {
    return this.model
      .findOne({ _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
  }

  findActive(tenantId: string, projectId: string) {
    return this.model
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), isActive: true })
      .exec();
  }

  findByNameOrYear(tenantId: string, projectId: string, value: string) {
    const year = Number(value);
    const yearFilter = Number.isNaN(year) ? undefined : year;
    return this.model
      .findOne({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        $or: [
          { name: value },
          ...(yearFilter ? [{ year: yearFilter }] : []),
        ],
      })
      .exec();
  }

  create(data: Partial<PgvVersion>) {
    return this.model.create(data);
  }

  update(tenantId: string, projectId: string, id: string, data: Partial<PgvVersion>) {
    return this.model
      .findOneAndUpdate(
        { _id: id, tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  async setActive(tenantId: string, projectId: string, id: string) {
    await this.model.updateMany(
      { tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
      { isActive: false },
    );
    return this.update(tenantId, projectId, id, { isActive: true });
  }
}
