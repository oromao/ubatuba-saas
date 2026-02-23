import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import {
  ReurbAuditLog,
  ReurbAuditLogDocument,
  ReurbDeliverable,
  ReurbDeliverableDocument,
  ReurbDocumentPendency,
  ReurbDocumentPendencyDocument,
  ReurbFamily,
  ReurbFamilyDocument,
  TenantConfig,
  TenantConfigDocument,
} from './reurb.schema';

@Injectable()
export class ReurbRepository {
  constructor(
    @InjectModel(TenantConfig.name)
    private readonly tenantConfigModel: Model<TenantConfigDocument>,
    @InjectModel(ReurbFamily.name)
    private readonly familyModel: Model<ReurbFamilyDocument>,
    @InjectModel(ReurbDocumentPendency.name)
    private readonly pendencyModel: Model<ReurbDocumentPendencyDocument>,
    @InjectModel(ReurbDeliverable.name)
    private readonly deliverableModel: Model<ReurbDeliverableDocument>,
    @InjectModel(ReurbAuditLog.name)
    private readonly auditModel: Model<ReurbAuditLogDocument>,
  ) {}

  findTenantConfig(tenantId: string) {
    return this.tenantConfigModel.findOne({ tenantId: asObjectId(tenantId) }).exec();
  }

  upsertTenantConfig(tenantId: string, data: Partial<TenantConfig>) {
    return this.tenantConfigModel
      .findOneAndUpdate({ tenantId: asObjectId(tenantId) }, data, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
      .exec();
  }

  createFamily(data: Partial<ReurbFamily>) {
    return this.familyModel.create(data);
  }

  listFamilies(
    tenantId: string,
    projectId: string,
    filters?: { status?: string; nucleus?: string; q?: string },
  ) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };

    if (filters?.status) query.status = filters.status;
    if (filters?.nucleus) query.nucleus = filters.nucleus;
    if (filters?.q) {
      const regex = new RegExp(filters.q, 'i');
      query.$or = [
        { familyCode: regex },
        { responsibleName: regex },
        { cpf: regex },
        { address: regex },
      ];
    }

    return this.familyModel.find(query).sort({ updatedAt: -1 }).exec();
  }

  findFamilyById(tenantId: string, projectId: string, familyId: string) {
    return this.familyModel
      .findOne({
        _id: familyId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  updateFamily(tenantId: string, projectId: string, familyId: string, data: Partial<ReurbFamily>) {
    return this.familyModel
      .findOneAndUpdate(
        {
          _id: familyId,
          tenantId: asObjectId(tenantId),
          projectId: asObjectId(projectId),
        },
        data,
        { new: true },
      )
      .exec();
  }

  createPendency(data: Partial<ReurbDocumentPendency>) {
    return this.pendencyModel.create(data);
  }

  listPendencies(
    tenantId: string,
    projectId: string,
    filters?: { status?: string; nucleus?: string; familyId?: string },
  ) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (filters?.status) query.status = filters.status;
    if (filters?.nucleus) query.nucleus = filters.nucleus;
    if (filters?.familyId) query.familyId = asObjectId(filters.familyId);
    return this.pendencyModel.find(query).sort({ updatedAt: -1 }).exec();
  }

  findPendencyById(tenantId: string, projectId: string, pendencyId: string) {
    return this.pendencyModel
      .findOne({
        _id: pendencyId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  async updatePendencyStatus(
    tenantId: string,
    projectId: string,
    pendencyId: string,
    params: {
      status: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
      observation?: string;
      actorId?: Types.ObjectId;
      statusHistoryEntry: {
        id: string;
        previousStatus?: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
        nextStatus: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA';
        observation?: string;
        actorId?: Types.ObjectId;
        at: string;
      };
    },
  ) {
    return this.pendencyModel
      .findOneAndUpdate(
        {
          _id: pendencyId,
          tenantId: asObjectId(tenantId),
          projectId: asObjectId(projectId),
        },
        {
          $set: {
            status: params.status,
            observation: params.observation,
            updatedBy: params.actorId,
          },
          $push: {
            statusHistory: params.statusHistoryEntry,
          },
        },
        { new: true },
      )
      .exec();
  }

  async createDeliverable(data: Partial<ReurbDeliverable>) {
    return this.deliverableModel.create(data);
  }

  listDeliverables(tenantId: string, projectId: string, kind?: string) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (kind) query.kind = kind;
    return this.deliverableModel.find(query).sort({ createdAt: -1 }).exec();
  }

  findDeliverableById(tenantId: string, projectId: string, deliverableId: string) {
    return this.deliverableModel
      .findOne({
        _id: deliverableId,
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  async nextDeliverableVersion(tenantId: string, projectId: string, kind: string) {
    const latest = await this.deliverableModel
      .findOne({
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
        kind,
      })
      .sort({ version: -1 })
      .exec();
    return (latest?.version ?? 0) + 1;
  }

  createAuditLog(data: Partial<ReurbAuditLog>) {
    return this.auditModel.create(data);
  }
}
