import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { CemeteryController } from './cemetery.controller';
import { CemeteryPlot, CemeteryPlotSchema } from './cemetery.schema';
import { CemeteryRepository } from './cemetery.repository';
import { CemeteryService } from './cemetery.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: CemeteryPlot.name, schema: CemeteryPlotSchema }])],
  controllers: [CemeteryController],
  providers: [CemeteryRepository, CemeteryService, CacheService, RedisService],
  exports: [CemeteryService],
})
export class CemeteryModule {}
