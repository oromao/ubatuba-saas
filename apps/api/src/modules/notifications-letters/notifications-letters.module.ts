import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CtmModule } from '../ctm/ctm.module';
import { ProjectsModule } from '../projects/projects.module';
import { ObjectStorageService } from '../shared/object-storage.service';
import { LetterBatch, LetterBatchSchema } from './letter-batch.schema';
import { LetterTemplate, LetterTemplateSchema } from './letter-template.schema';
import { NotificationsLettersController } from './notifications-letters.controller';
import { NotificationsLettersRepository } from './notifications-letters.repository';
import { NotificationsLettersService } from './notifications-letters.service';

@Module({
  imports: [
    ProjectsModule,
    CtmModule,
    MongooseModule.forFeature([
      { name: LetterTemplate.name, schema: LetterTemplateSchema },
      { name: LetterBatch.name, schema: LetterBatchSchema },
    ]),
  ],
  controllers: [NotificationsLettersController],
  providers: [NotificationsLettersRepository, NotificationsLettersService, ObjectStorageService],
})
export class NotificationsLettersModule {}

