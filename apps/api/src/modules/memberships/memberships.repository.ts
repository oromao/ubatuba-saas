import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership, MembershipDocument } from './membership.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class MembershipsRepository {
  constructor(@InjectModel(Membership.name) private readonly model: Model<MembershipDocument>) {}

  findByUserAndTenant(userId: string, tenantId: string) {
    return this.model
      .findOne({ userId: asObjectId(userId), tenantId: asObjectId(tenantId) })
      .exec();
  }

  create(data: Partial<Membership>) {
    return this.model.create(data);
  }
}
