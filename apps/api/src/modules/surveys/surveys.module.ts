import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Layer, LayerSchema } from '../layers/layer.schema';
import { ProjectsModule } from '../projects/projects.module';
import { GeoserverPublisherService } from '../shared/geoserver-publisher.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { Survey, SurveySchema } from './survey.schema';
import { SurveysController } from './surveys.controller';
import { SurveysRepository } from './surveys.repository';
import { SurveysService } from './surveys.service';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: Layer.name, schema: LayerSchema },
    ]),
  ],
  controllers: [SurveysController],
  providers: [SurveysRepository, SurveysService, ObjectStorageService, GeoserverPublisherService],
})
export class SurveysModule {}

