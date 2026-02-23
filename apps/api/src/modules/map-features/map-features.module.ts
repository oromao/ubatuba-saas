import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapFeaturesController } from './map-features.controller';
import { MapFeaturesService } from './map-features.service';
import { MapFeaturesRepository } from './map-features.repository';
import { MapFeature, MapFeatureSchema } from './map-feature.schema';
import { ProjectsModule } from '../projects/projects.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MapFeature.name, schema: MapFeatureSchema }]),
    ProjectsModule,
    TenantsModule,
  ],
  controllers: [MapFeaturesController],
  providers: [MapFeaturesService, MapFeaturesRepository],
})
export class MapFeaturesModule {}
