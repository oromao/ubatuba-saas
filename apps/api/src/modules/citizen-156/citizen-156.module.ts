import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertsModule } from '../alerts/alerts.module';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { Citizen156Controller } from './citizen-156.controller';
import { Citizen156Repository } from './citizen-156.repository';
import { Citizen156Service } from './citizen-156.service';
import { CitizenCall, CitizenCallSchema } from './citizen-call.schema';

@Module({
  imports: [
    AlertsModule,
    ProjectsModule,
    MongooseModule.forFeature([{ name: CitizenCall.name, schema: CitizenCallSchema }]),
  ],
  controllers: [Citizen156Controller],
  providers: [Citizen156Repository, Citizen156Service, CacheService, RedisService],
  exports: [Citizen156Service],
})
export class Citizen156Module {}
