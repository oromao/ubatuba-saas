import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from './upload.schema';
import { UploadsRepository } from './uploads.repository';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ObjectStorageService } from '../shared/object-storage.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  controllers: [UploadController],
  providers: [UploadsRepository, UploadService, ObjectStorageService],
  exports: [UploadsRepository, UploadService],
})
export class UploadsModule {}
