import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { RedisService } from '../shared/redis.service';
import { PermitWorkRequest, PermitWorkRequestSchema } from './permit-work.schema';
import { PermitsWorksController } from './permits-works.controller';
import { PermitsWorksRepository } from './permits-works.repository';
import { PermitsWorksService } from './permits-works.service';

@Module({
  imports: [ProjectsModule, MongooseModule.forFeature([{ name: PermitWorkRequest.name, schema: PermitWorkRequestSchema }])],
  controllers: [PermitsWorksController],
  providers: [PermitsWorksRepository, PermitsWorksService, CacheService, RedisService, ObjectStorageService],
  exports: [PermitsWorksService],
})
export class PermitsWorksModule {}
