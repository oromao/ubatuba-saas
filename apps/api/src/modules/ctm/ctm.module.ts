import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ParcelsController } from './parcels/parcels.controller';
import { ProjectParcelsController } from './parcels/project-parcels.controller';
import { ParcelsService } from './parcels/parcels.service';
import { ParcelsRepository } from './parcels/parcels.repository';
import { Parcel, ParcelSchema } from './parcels/parcel.schema';
import { ParcelAuditLog, ParcelAuditLogSchema } from './parcels/parcel-audit.schema';
import { ImportBatch, ImportBatchSchema } from './parcels/import-batch.schema';
import { ImportBatchRepository } from './parcels/import-batch.repository';
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
import { UploadsModule } from '../uploads/uploads.module';
import { Vistoria, VistoriaSchema } from './vistoria.schema';
import { VistoriasService } from './vistorias.service';
import { VistoriasController } from './vistorias.controller';
import { GeometryService } from './geometry.service';
import { ParcelSubdivision, ParcelSubdivisionSchema } from './parcels/parcel-subdivision.schema';
import { ParcelSubdivisionRepository } from './parcels/parcel-subdivision.repository';
import { ParcelSubdivisionService } from './parcels/parcel-subdivision.service';
import { ParcelSubdivisionController } from './parcels/parcel-subdivision.controller';
import { ShapefileImportService } from './parcels/shapefile-import.service';

@Module({
  imports: [
    JwtModule.register({}),
    ProjectsModule,
    UploadsModule,
    MongooseModule.forFeature([
      { name: Vistoria.name, schema: VistoriaSchema },
      { name: Parcel.name, schema: ParcelSchema },
      { name: ParcelAuditLog.name, schema: ParcelAuditLogSchema },
      { name: ImportBatch.name, schema: ImportBatchSchema },
      { name: Logradouro.name, schema: LogradouroSchema },
      { name: ParcelBuilding.name, schema: ParcelBuildingSchema },
      { name: ParcelSocioeconomic.name, schema: ParcelSocioeconomicSchema },
      { name: ParcelInfrastructure.name, schema: ParcelInfrastructureSchema },
      { name: UrbanFurniture.name, schema: UrbanFurnitureSchema },
      { name: ParcelSubdivision.name, schema: ParcelSubdivisionSchema },
    ]),
  ],
  controllers: [
    ParcelsController,
    ProjectParcelsController,
    LogradourosController,
    UrbanFurnitureController,
    VistoriasController,
    ParcelSubdivisionController,
  ],
  providers: [
    ParcelsRepository,
    ImportBatchRepository,
    ParcelsService,
    VistoriasService,
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
    GeometryService,
    ParcelSubdivisionRepository,
    ParcelSubdivisionService,
    ShapefileImportService,
  ],
  exports: [
    ParcelsRepository,
    ParcelBuildingsRepository,
    ParcelSocioeconomicRepository,
    ParcelInfrastructureRepository,
    ImportBatchRepository,
    ParcelsService,
    GeometryService,
    ParcelAuditRepository,
    ParcelSubdivisionService,
  ],
})
export class CtmModule {}
