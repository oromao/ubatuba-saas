import { Module } from '@nestjs/common';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';

@Module({
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
