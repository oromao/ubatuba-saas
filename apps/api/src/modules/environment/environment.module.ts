import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { RedisService } from '../shared/redis.service';
import { EnvironmentCase, EnvironmentCaseSchema } from './environment-case.schema';
import { EnvironmentController } from './environment.controller';
import { EnvironmentRepository } from './environment.repository';
import { EnvironmentService } from './environment.service';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([{ name: EnvironmentCase.name, schema: EnvironmentCaseSchema }]),
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentRepository, EnvironmentService, CacheService, RedisService, ObjectStorageService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
