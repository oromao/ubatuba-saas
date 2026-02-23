import { Injectable } from '@nestjs/common';
import { MembershipsRepository } from './memberships.repository';
import { Role } from '../../common/guards/roles.decorator';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class MembershipsService {
  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  findByUserAndTenant(userId: string, tenantId: string) {
    return this.membershipsRepository.findByUserAndTenant(userId, tenantId);
  }

  create(data: { tenantId: string; userId: string; role: Role }) {
    return this.membershipsRepository.create({
      tenantId: asObjectId(data.tenantId),
      userId: asObjectId(data.userId),
      role: data.role,
    });
  }
}
