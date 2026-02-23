import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PgvZone, PgvZoneSchema } from './zones/zone.schema';
import { PgvFace, PgvFaceSchema } from './faces/face.schema';
import { PgvFactor, PgvFactorSchema } from './factors/factor.schema';
import { PgvFactorSet, PgvFactorSetSchema } from './factor-sets/factor-set.schema';
import { PgvVersion, PgvVersionSchema } from './versions/version.schema';
import { PgvValuation, PgvValuationSchema } from './valuations/valuation.schema';
import { PgvAssessment, PgvAssessmentSchema } from './assessments/assessment.schema';
import { ZonesRepository } from './zones/zones.repository';
import { ZonesService } from './zones/zones.service';
import { ZonesController } from './zones/zones.controller';
import { FacesRepository } from './faces/faces.repository';
import { FacesService } from './faces/faces.service';
import { FacesController } from './faces/faces.controller';
import { FactorsRepository } from './factors/factors.repository';
import { FactorsService } from './factors/factors.service';
import { FactorsController } from './factors/factors.controller';
import { FactorSetsRepository } from './factor-sets/factor-sets.repository';
import { FactorSetsService } from './factor-sets/factor-sets.service';
import { FactorSetsController } from './factor-sets/factor-sets.controller';
import { VersionsRepository } from './versions/versions.repository';
import { VersionsService } from './versions/versions.service';
import { VersionsController } from './versions/versions.controller';
import { ValuationsRepository } from './valuations/valuations.repository';
import { ValuationsService } from './valuations/valuations.service';
import { ValuationsController } from './valuations/valuations.controller';
import { AssessmentsRepository } from './assessments/assessments.repository';
import { PgvController } from './pgv.controller';
import { ProjectsModule } from '../projects/projects.module';
import { CtmModule } from '../ctm/ctm.module';

@Module({
  imports: [
    ProjectsModule,
    CtmModule,
    MongooseModule.forFeature([
      { name: PgvZone.name, schema: PgvZoneSchema },
      { name: PgvFace.name, schema: PgvFaceSchema },
      { name: PgvFactor.name, schema: PgvFactorSchema },
      { name: PgvFactorSet.name, schema: PgvFactorSetSchema },
      { name: PgvVersion.name, schema: PgvVersionSchema },
      { name: PgvValuation.name, schema: PgvValuationSchema },
      { name: PgvAssessment.name, schema: PgvAssessmentSchema },
    ]),
  ],
  controllers: [
    ZonesController,
    FacesController,
    FactorsController,
    FactorSetsController,
    VersionsController,
    ValuationsController,
    PgvController,
  ],
  providers: [
    ZonesRepository,
    ZonesService,
    FacesRepository,
    FacesService,
    FactorsRepository,
    FactorsService,
    FactorSetsRepository,
    FactorSetsService,
    VersionsRepository,
    VersionsService,
    ValuationsRepository,
    ValuationsService,
    AssessmentsRepository,
  ],
})
export class PgvModule {}
