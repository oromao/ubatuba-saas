import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { asObjectId } from '../../common/utils/object-id';

@Injectable()
export class ProjectsRepository {
  constructor(@InjectModel(Project.name) private readonly model: Model<ProjectDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  findBySlug(tenantId: string, slug: string) {
    return this.model.findOne({ tenantId: asObjectId(tenantId), slug }).exec();
  }

  findDefault(tenantId: string) {
    return this.model.findOne({ tenantId: asObjectId(tenantId), isDefault: true }).exec();
  }

  create(data: Partial<Project>) {
    return this.model.create(data);
  }

  update(tenantId: string, id: string, data: Partial<Project>) {
    return this.model
      .findOneAndUpdate({ _id: id, tenantId: asObjectId(tenantId) }, data, { new: true })
      .exec();
  }
}
