import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MapFeaturesService } from './map-features.service';
import { CreateMapFeatureDto } from './dto/create-map-feature.dto';
import { UpdateMapFeatureDto } from './dto/update-map-feature.dto';

@Controller('map-features')
export class MapFeaturesController {
  constructor(private readonly mapFeaturesService: MapFeaturesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CreateMapFeatureDto,
  ) {
    return this.mapFeaturesService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateMapFeatureDto,
  ) {
    return this.mapFeaturesService.update(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.mapFeaturesService.remove(req.tenantId, projectId, id);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
    @Query('type') featureType?: string,
  ) {
    return this.mapFeaturesService.geojson(req.tenantId, projectId, featureType, bbox);
  }
}
