import { Controller, Get, Query, Req } from '@nestjs/common';
import { RoadsService } from './roads.service';

@Controller('osm/roads')
export class RoadsController {
  constructor(private readonly roadsService: RoadsService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.roadsService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.roadsService.geojson(req.tenantId, projectId, bbox);
  }
}
