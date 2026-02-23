import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParcelsController } from './parcels/parcels.controller';
import { ProjectParcelsController } from './parcels/project-parcels.controller';
import { ParcelsService } from './parcels/parcels.service';
import { ParcelsRepository } from './parcels/parcels.repository';
import { Parcel, ParcelSchema } from './parcels/parcel.schema';
import { ParcelAuditLog, ParcelAuditLogSchema } from './parcels/parcel-audit.schema';
import { Logradouro, LogradouroSchema } from './logradouros/logradouro.schema';
import { LogradourosRepository } from './logradouros/logradouros.repository';
import { LogradourosService } from './logradouros/logradouros.service';
import { LogradourosController } from './logradouros/logradouros.controller';
import {
  ParcelBuilding,
  ParcelBuildingSchema,
} from './parcel-buildings/parcel-building.schema';
import { ParcelBuildingsRepository } from './parcel-buildings/parcel-buildings.repository';
import { ParcelBuildingsService } from './parcel-buildings/parcel-buildings.service';
import {
  ParcelSocioeconomic,
  ParcelSocioeconomicSchema,
} from './parcel-socioeconomic/parcel-socioeconomic.schema';
import { ParcelSocioeconomicRepository } from './parcel-socioeconomic/parcel-socioeconomic.repository';
import { ParcelSocioeconomicService } from './parcel-socioeconomic/parcel-socioeconomic.service';
import {
  ParcelInfrastructure,
  ParcelInfrastructureSchema,
} from './parcel-infrastructure/parcel-infrastructure.schema';
import { ParcelInfrastructureRepository } from './parcel-infrastructure/parcel-infrastructure.repository';
import { ParcelInfrastructureService } from './parcel-infrastructure/parcel-infrastructure.service';
import {
  UrbanFurniture,
  UrbanFurnitureSchema,
} from './urban-furniture/urban-furniture.schema';
import { UrbanFurnitureRepository } from './urban-furniture/urban-furniture.repository';
import { UrbanFurnitureService } from './urban-furniture/urban-furniture.service';
import { UrbanFurnitureController } from './urban-furniture/urban-furniture.controller';
import { ProjectsModule } from '../projects/projects.module';
import { ParcelAuditRepository } from './parcels/parcel-audit.repository';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: ParcelAuditLog.name, schema: ParcelAuditLogSchema },
      { name: Logradouro.name, schema: LogradouroSchema },
      { name: ParcelBuilding.name, schema: ParcelBuildingSchema },
      { name: ParcelSocioeconomic.name, schema: ParcelSocioeconomicSchema },
      { name: ParcelInfrastructure.name, schema: ParcelInfrastructureSchema },
      { name: UrbanFurniture.name, schema: UrbanFurnitureSchema },
    ]),
  ],
  controllers: [
    ParcelsController,
    ProjectParcelsController,
    LogradourosController,
    UrbanFurnitureController,
  ],
  providers: [
    ParcelsRepository,
    ParcelsService,
    LogradourosRepository,
    LogradourosService,
    ParcelBuildingsRepository,
    ParcelBuildingsService,
    ParcelSocioeconomicRepository,
    ParcelSocioeconomicService,
    ParcelInfrastructureRepository,
    ParcelInfrastructureService,
    UrbanFurnitureRepository,
    UrbanFurnitureService,
    ParcelAuditRepository,
  ],
  exports: [
    ParcelsRepository,
    ParcelBuildingsRepository,
    ParcelSocioeconomicRepository,
    ParcelInfrastructureRepository,
    ParcelsService,
  ],
})
export class CtmModule {}
