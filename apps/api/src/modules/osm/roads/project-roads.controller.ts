import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { RoadsService } from './roads.service';

@Controller('api/projects/:projectId/roads')
export class ProjectRoadsController {
  constructor(private readonly roadsService: RoadsService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.roadsService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.roadsService.geojson(req.tenantId, projectId, bbox);
  }
}
