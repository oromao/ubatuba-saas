import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { Area, AreaSchema } from './area.schema';
import { AreasController } from './areas.controller';
import { AreasRepository } from './areas.repository';
import { AreasService } from './areas.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }])],
  controllers: [AreasController],
  providers: [AreasService, AreasRepository, CacheService, RedisService],
})
export class AreasModule {}
