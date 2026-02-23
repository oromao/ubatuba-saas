import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './tenant.schema';

@Injectable()
export class TenantsRepository {
  constructor(@InjectModel(Tenant.name) private readonly model: Model<TenantDocument>) {}

  create(data: Partial<Tenant>) {
    return this.model.create(data);
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  findBySlug(slug: string) {
    return this.model.findOne({ slug }).exec();
  }
}
