import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { Process, ProcessSchema } from './process.schema';
import { ProcessEvent, ProcessEventSchema } from './process-event.schema';
import { ProcessesController } from './processes.controller';
import { ProcessesRepository } from './processes.repository';
import { ProcessesService } from './processes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Process.name, schema: ProcessSchema },
      { name: ProcessEvent.name, schema: ProcessEventSchema },
    ]),
  ],
  controllers: [ProcessesController],
  providers: [ProcessesRepository, ProcessesService, CacheService, RedisService],
  exports: [ProcessesService],
})
export class ProcessesModule {}
