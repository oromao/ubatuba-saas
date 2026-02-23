import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { PocService } from './poc.service';

@ApiTags('poc')
@Controller('poc')
export class PocController {
  constructor(private readonly service: PocService) {}

  @Get('health')
  @Public()
  health() {
    return this.service.health();
  }

  @Get('score')
  @Public()
  score() {
    return this.service.score();
  }
}
