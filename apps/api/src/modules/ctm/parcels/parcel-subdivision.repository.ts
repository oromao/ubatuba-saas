import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParcelSubdivision, ParcelSubdivisionDocument, SubdivisionStatus } from './parcel-subdivision.schema';

@Injectable()
export class ParcelSubdivisionRepository {
  constructor(
    @InjectModel(ParcelSubdivision.name)
    private readonly model: Model<ParcelSubdivisionDocument>,
  ) {}

  async create(data: Record<string, unknown>): Promise<ParcelSubdivisionDocument> {
    return this.model.create(data);
  }

  async findById(tenantId: string, id: string): Promise<ParcelSubdivisionDocument | null> {
    return this.model.findOne({ _id: id, tenantId }).exec();
  }

  async list(
    tenantId: string,
    projectId: string,
    filters?: { status?: SubdivisionStatus; tipo?: string; parentParcelId?: string },
  ): Promise<ParcelSubdivisionDocument[]> {
    const query: Record<string, unknown> = { tenantId, projectId };
    if (filters?.status) query.status = filters.status;
    if (filters?.tipo) query.tipo = filters.tipo;
    if (filters?.parentParcelId) query.parentParcelId = filters.parentParcelId;
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, tenantId: string, data: Record<string, unknown>): Promise<ParcelSubdivisionDocument | null> {
    return this.model.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true }).exec();
  }
}
