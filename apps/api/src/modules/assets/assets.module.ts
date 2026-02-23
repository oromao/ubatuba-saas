import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { Asset, AssetSchema } from './asset.schema';
import { AssetsController } from './assets.controller';
import { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }])],
  controllers: [AssetsController],
  providers: [AssetsRepository, AssetsService, CacheService, RedisService],
  exports: [AssetsService],
})
export class AssetsModule {}
