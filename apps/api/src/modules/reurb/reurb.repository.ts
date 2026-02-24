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
  ReurbNotification,
  ReurbNotificationDocument,
  ReurbNotificationTemplate,
  ReurbNotificationTemplateDocument,
  ReurbProject,
  ReurbProjectDocument,
  ReurbUnit,
  ReurbUnitDocument,
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
    @InjectModel(ReurbProject.name)
    private readonly projectModel: Model<ReurbProjectDocument>,
    @InjectModel(ReurbUnit.name)
    private readonly unitModel: Model<ReurbUnitDocument>,
    @InjectModel(ReurbNotificationTemplate.name)
    private readonly notificationTemplateModel: Model<ReurbNotificationTemplateDocument>,
    @InjectModel(ReurbNotification.name)
    private readonly notificationModel: Model<ReurbNotificationDocument>,
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

  createProject(data: Partial<ReurbProject>) {
    return this.projectModel.create(data);
  }

  listProjects(tenantId: string) {
    return this.projectModel.find({ tenantId: asObjectId(tenantId) }).sort({ updatedAt: -1 }).exec();
  }

  findProjectById(tenantId: string, projectId: string) {
    return this.projectModel
      .findOne({ _id: asObjectId(projectId), tenantId: asObjectId(tenantId) })
      .exec();
  }

  updateProject(tenantId: string, projectId: string, data: Partial<ReurbProject>) {
    return this.projectModel
      .findOneAndUpdate(
        { _id: asObjectId(projectId), tenantId: asObjectId(tenantId) },
        data,
        { new: true },
      )
      .exec();
  }

  async nextNotificationTemplateVersion(tenantId: string, projectId: string, name: string) {
    const latest = await this.notificationTemplateModel
      .findOne({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId), name })
      .sort({ version: -1 })
      .exec();
    return (latest?.version ?? 0) + 1;
  }

  createNotificationTemplate(data: Partial<ReurbNotificationTemplate>) {
    return this.notificationTemplateModel.create(data);
  }

  listNotificationTemplates(tenantId: string, projectId: string) {
    return this.notificationTemplateModel
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  findNotificationTemplateById(tenantId: string, projectId: string, templateId: string) {
    return this.notificationTemplateModel
      .findOne({
        _id: asObjectId(templateId),
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  updateNotificationTemplate(
    tenantId: string,
    projectId: string,
    templateId: string,
    data: Partial<ReurbNotificationTemplate>,
  ) {
    return this.notificationTemplateModel
      .findOneAndUpdate(
        { _id: asObjectId(templateId), tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
      .exec();
  }

  createNotification(data: Partial<ReurbNotification>) {
    return this.notificationModel.create(data);
  }

  listNotifications(tenantId: string, projectId: string) {
    return this.notificationModel
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findNotificationById(tenantId: string, projectId: string, notificationId: string) {
    return this.notificationModel
      .findOne({
        _id: asObjectId(notificationId),
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  updateNotification(
    tenantId: string,
    projectId: string,
    notificationId: string,
    data: Partial<ReurbNotification>,
  ) {
    return this.notificationModel
      .findOneAndUpdate(
        { _id: asObjectId(notificationId), tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) },
        data,
        { new: true },
      )
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

  createUnit(data: Partial<ReurbUnit>) {
    return this.unitModel.create(data);
  }

  listUnits(
    tenantId: string,
    projectId: string,
    filters?: { code?: string; block?: string; lot?: string },
  ) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (filters?.code) query.code = new RegExp(filters.code, 'i');
    if (filters?.block) query.block = new RegExp(filters.block, 'i');
    if (filters?.lot) query.lot = new RegExp(filters.lot, 'i');
    return this.unitModel.find(query).sort({ updatedAt: -1 }).exec();
  }

  findUnitById(tenantId: string, projectId: string, unitId: string) {
    return this.unitModel
      .findOne({
        _id: asObjectId(unitId),
        tenantId: asObjectId(tenantId),
        projectId: asObjectId(projectId),
      })
      .exec();
  }

  updateUnit(tenantId: string, projectId: string, unitId: string, data: Partial<ReurbUnit>) {
    return this.unitModel
      .findOneAndUpdate(
        {
          _id: asObjectId(unitId),
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

  listAuditLogs(
    tenantId: string,
    projectId: string,
    filters?: { action?: string; limit?: number },
  ) {
    const query: Record<string, unknown> = {
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
    };
    if (filters?.action) query.action = filters.action;
    return this.auditModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit ?? 200)
      .exec();
  }
}
