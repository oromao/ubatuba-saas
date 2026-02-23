import { Controller, Get, Query, Req } from '@nestjs/common';
import { AreasService } from './areas.service';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  list(@Req() req: { tenantId: string }, @Query('group') group?: string) {
    return this.areasService.list(req.tenantId, group);
  }
}
