import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { MobileController } from './mobile.controller';
import { MobileFieldRecord, MobileFieldRecordSchema } from './mobile-field-record.schema';
import { MobileRepository } from './mobile.repository';
import { MobileService } from './mobile.service';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([{ name: MobileFieldRecord.name, schema: MobileFieldRecordSchema }]),
  ],
  controllers: [MobileController],
  providers: [MobileRepository, MobileService],
})
export class MobileModule {}

