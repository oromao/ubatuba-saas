import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { LayersController } from './layers.controller';
import { Layer, LayerSchema } from './layer.schema';
import { LayersRepository } from './layers.repository';
import { LayersService } from './layers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Layer.name, schema: LayerSchema }])],
  controllers: [LayersController],
  providers: [LayersService, LayersRepository, CacheService, RedisService],
})
export class LayersModule {}
