import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { MobileFieldRecord, MobileFieldRecordDocument } from './mobile-field-record.schema';

@Injectable()
export class MobileRepository {
  constructor(
    @InjectModel(MobileFieldRecord.name)
    private readonly model: Model<MobileFieldRecordDocument>,
  ) {}

  create(data: Partial<MobileFieldRecord>) {
    return this.model.create(data);
  }

  list(tenantId: string, projectId: string) {
    return this.model
      .find({ tenantId: asObjectId(tenantId), projectId: asObjectId(projectId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .exec();
  }

  async summary(tenantId: string, projectId: string) {
    const items = await this.list(tenantId, projectId);
    return {
      total: items.length,
      processado: items.filter((item) => item.syncStatus === 'PROCESSADO').length,
      conflito: items.filter((item) => item.syncStatus === 'CONFLITO').length,
      recebido: items.filter((item) => item.syncStatus === 'RECEBIDO').length,
      comEvidencias: items.filter((item) => (item.evidences?.length ?? 0) > 0).length,
      evidenciasTotal: items.reduce((acc, item) => acc + (item.evidences?.length ?? 0), 0),
      erros: items.filter((item) => item.syncStatus !== 'PROCESSADO').length,
    };
  }
}
