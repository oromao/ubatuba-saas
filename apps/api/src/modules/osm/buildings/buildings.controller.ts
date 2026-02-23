import { Controller, Get, Query, Req } from '@nestjs/common';
import { BuildingsService } from './buildings.service';

@Controller('osm/buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.buildingsService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.buildingsService.geojson(req.tenantId, projectId, bbox);
  }
}
