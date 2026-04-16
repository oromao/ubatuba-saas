import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from './upload.schema';
import { UploadsRepository } from './uploads.repository';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  controllers: [UploadController],
  providers: [UploadsRepository, UploadService],
  exports: [UploadsRepository, UploadService],
})
export class UploadsModule {}
