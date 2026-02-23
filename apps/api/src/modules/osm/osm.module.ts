import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { Road, RoadSchema } from './roads/road.schema';
import { RoadsRepository } from './roads/roads.repository';
import { RoadsService } from './roads/roads.service';
import { RoadsController } from './roads/roads.controller';
import { ProjectRoadsController } from './roads/project-roads.controller';
import { Building, BuildingSchema } from './buildings/building.schema';
import { BuildingsRepository } from './buildings/buildings.repository';
import { BuildingsService } from './buildings/buildings.service';
import { BuildingsController } from './buildings/buildings.controller';
import { ProjectBuildingsController } from './buildings/project-buildings.controller';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: Road.name, schema: RoadSchema },
      { name: Building.name, schema: BuildingSchema },
    ]),
  ],
  controllers: [
    RoadsController,
    ProjectRoadsController,
    BuildingsController,
    ProjectBuildingsController,
  ],
  providers: [RoadsRepository, RoadsService, BuildingsRepository, BuildingsService],
  exports: [RoadsRepository, BuildingsRepository],
})
export class OsmModule {}
