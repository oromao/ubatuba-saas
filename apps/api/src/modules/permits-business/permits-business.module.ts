import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { ObjectStorageService } from '../shared/object-storage.service';
import { RedisService } from '../shared/redis.service';
import { PermitBusinessRequest, PermitBusinessRequestSchema } from './permit-business.schema';
import { PermitsBusinessController } from './permits-business.controller';
import { PermitsBusinessRepository } from './permits-business.repository';
import { PermitsBusinessService } from './permits-business.service';

@Module({
  imports: [ProjectsModule, MongooseModule.forFeature([{ name: PermitBusinessRequest.name, schema: PermitBusinessRequestSchema }])],
  controllers: [PermitsBusinessController],
  providers: [PermitsBusinessRepository, PermitsBusinessService, CacheService, RedisService, ObjectStorageService],
  exports: [PermitsBusinessService],
})
export class PermitsBusinessModule {}
