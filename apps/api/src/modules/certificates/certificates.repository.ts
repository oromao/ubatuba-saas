import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { asObjectId } from '../../common/utils/object-id';
import { Certificate, CertificateDocument } from './certificate.schema';

@Injectable()
export class CertificatesRepository {
  constructor(@InjectModel(Certificate.name) private readonly model: Model<CertificateDocument>) {}

  list(tenantId: string) {
    return this.model.find({ tenantId: asObjectId(tenantId) }).sort({ createdAt: -1 }).exec();
  }

  findById(tenantId: string, id: string) {
    return this.model.findOne({ _id: id, tenantId: asObjectId(tenantId) }).exec();
  }

  findByValidationCode(tenantId: string, validationCode: string) {
    return this.model.findOne({ tenantId: asObjectId(tenantId), validationCode }).exec();
  }

  create(data: Partial<Certificate>) {
    return this.model.create(data);
  }
}
