import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { PublicWork, PublicWorkSchema } from './public-work.schema';
import { PublicWorksController } from './public-works.controller';
import { PublicWorksRepository } from './public-works.repository';
import { PublicWorksService } from './public-works.service';

@Module({
  imports: [ProjectsModule, MongooseModule.forFeature([{ name: PublicWork.name, schema: PublicWorkSchema }])],
  controllers: [PublicWorksController],
  providers: [PublicWorksRepository, PublicWorksService, CacheService],
  exports: [PublicWorksService],
})
export class PublicWorksModule {}
