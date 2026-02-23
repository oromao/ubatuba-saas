import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Area, AreaDocument } from './area.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class AreasRepository {
  constructor(@InjectModel(Area.name) private readonly model: Model<AreaDocument>) {}

  list(tenantId: string, group?: string) {
    const query = group
      ? { tenantId: asObjectId(tenantId), group }
      : { tenantId: asObjectId(tenantId) };
    return this.model.find(query).exec();
  }
}
