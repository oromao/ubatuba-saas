import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LgpdAudit, LgpdAuditDocument } from '../schemas/lgpd-audit.schema';

export interface AuditEntry {
  tenantId: string;
  action: 'READ_PERSONAL_DATA' | 'EXPORT_PERSONAL_DATA' | 'DELETE_PERSONAL_DATA' | 'ANONYMIZE' | 'CONSENT_RECORDED';
  resourceType: 'PARCEL' | 'CITIZEN' | 'VISTORIA' | 'CERTIFICATE' | 'CITIZEN_CALL';
  resourceId: string;
  fields?: string[];
  actorId?: string;
  actorRole?: string;
  ipAddress?: string;
  reason?: string;
  consentId?: string;
}

@Injectable()
export class LgpdAuditService {
  constructor(
    @InjectModel(LgpdAudit.name) private readonly model: Model<LgpdAuditDocument>,
  ) {}

  async logAccess(entry: AuditEntry): Promise<void> {
    await this.model.create({
      tenantId: entry.tenantId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      fields: entry.fields,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      ipAddress: entry.ipAddress,
      reason: entry.reason,
      consentId: entry.consentId,
      anonymized: false,
    });
  }

  async query(filters: {
    tenantId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<LgpdAuditDocument[]> {
    const query: Record<string, unknown> = {};
    if (filters.tenantId) query.tenantId = filters.tenantId;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.resourceId) query.resourceId = filters.resourceId;
    if (filters.action) query.action = filters.action;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {} as any;
      if (filters.startDate) (query.createdAt as any).$gte = new Date(filters.startDate);
      if (filters.endDate) (query.createdAt as any).$lte = new Date(filters.endDate);
    }
    return this.model.find(query).sort({ createdAt: -1 }).limit(filters.limit ?? 100).exec();
  }

  async anonymize(tenantId: string, resourceType: string, resourceId: string): Promise<boolean> {
    await this.logAccess({
      tenantId,
      action: 'ANONYMIZE',
      resourceType: resourceType as any,
      resourceId,
      reason: 'Direito ao esquecimento (art. 18 LGPD)',
    });
    return true;
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.model.countDocuments({ tenantId }).exec();
  }
}
