import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Upload, UploadDocument } from './upload.schema';

@Injectable()
export class UploadsRepository {
  constructor(@InjectModel(Upload.name) private readonly model: Model<UploadDocument>) {}

  create(data: Partial<Upload>) {
    return this.model.create(data);
  }
}
