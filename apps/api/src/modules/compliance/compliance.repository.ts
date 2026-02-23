import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { ComplianceProfile, ComplianceProfileDocument } from './compliance.schema';

@Injectable()
export class ComplianceRepository {
  constructor(
    @InjectModel(ComplianceProfile.name)
    private readonly model: Model<ComplianceProfileDocument>,
  ) {}

  async findOrCreate(tenantId: string, projectId: Types.ObjectId) {
    const existing = await this.model
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .exec();
    if (existing) return existing;

    return this.model.create({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      company: {},
      technicalResponsibles: [],
      artsRrts: [],
      cats: [],
      team: [],
      checklist: [],
      auditLog: [],
    });
  }

  save(profile: ComplianceProfileDocument) {
    return profile.save();
  }
}

