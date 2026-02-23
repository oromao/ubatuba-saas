import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { BuildingsService } from './buildings.service';

@Controller('api/projects/:projectId/buildings')
export class ProjectBuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.buildingsService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.buildingsService.geojson(req.tenantId, projectId, bbox);
  }
}
