import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from './upload.schema';
import { UploadsRepository } from './uploads.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  providers: [UploadsRepository],
  exports: [UploadsRepository],
})
export class UploadsModule {}
