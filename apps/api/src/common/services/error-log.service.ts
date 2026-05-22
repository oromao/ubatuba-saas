import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog, ErrorLogDocument } from '../schemas/error-log.schema';

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectModel(ErrorLog.name) private readonly model: Model<ErrorLogDocument>,
  ) {}

  async log(entry: {
    status: number;
    method: string;
    url: string;
    detail?: string;
    trace?: string;
    errorCode?: string;
    tenantId?: string;
    userId?: string;
    correlationId?: string;
  }): Promise<void> {
    await this.model.create({
      status: entry.status,
      method: entry.method,
      url: entry.url,
      detail: entry.detail?.slice(0, 2000),
      trace: entry.trace?.slice(0, 5000),
      errorCode: entry.errorCode,
      tenantId: entry.tenantId,
      userId: entry.userId,
      correlationId: entry.correlationId,
      resolved: false,
    });
  }

  async list(filters?: {
    status?: number;
    unresolved?: boolean;
    limit?: number;
    tenantId?: string;
  }): Promise<ErrorLogDocument[]> {
    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.unresolved) query.resolved = false;
    if (filters?.tenantId) query.tenantId = filters.tenantId;
    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit ?? 50)
      .exec();
  }

  async countUnresolved(): Promise<number> {
    return this.model.countDocuments({ resolved: false }).exec();
  }

  async markResolved(id: string, by?: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { resolved: true, resolvedAt: new Date(), resolvedBy: by } },
    ).exec();
  }

  async getStats(hours = 24): Promise<{
    total: number;
    serverErrors: number;
    clientErrors: number;
    unresolved: number;
    topEndpoints: Array<{ url: string; count: number }>;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recent = await this.model.find({ createdAt: { $gte: since } }).exec();
    const serverErrors = recent.filter((e) => e.status >= 500).length;
    const clientErrors = recent.filter((e) => e.status >= 400 && e.status < 500).length;
    const endpointCount: Record<string, number> = {};
    for (const e of recent) {
      const key = `${e.method} ${e.url}`;
      endpointCount[key] = (endpointCount[key] ?? 0) + 1;
    }
    return {
      total: recent.length,
      serverErrors,
      clientErrors,
      unresolved: await this.countUnresolved(),
      topEndpoints: Object.entries(endpointCount)
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }
}
