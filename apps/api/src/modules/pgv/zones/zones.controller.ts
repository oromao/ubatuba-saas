import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('pgv/zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.zonesService.list(req.tenantId, projectId, bbox);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.zonesService.geojson(req.tenantId, projectId, bbox);
  }

  @Get(':id')
  get(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.zonesService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateZoneDto) {
    return this.zonesService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateZoneDto,
  ) {
    return this.zonesService.update(req.tenantId, projectId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.zonesService.remove(req.tenantId, projectId, id);
  }

  @Post('import')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  importGeojson(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() featureCollection: { type: 'FeatureCollection'; features: unknown[] },
  ) {
    return this.zonesService.importGeojson(
      req.tenantId,
      projectId,
      featureCollection as {
        type: 'FeatureCollection';
        features: Array<{ type: 'Feature'; id: string; geometry: unknown; properties: Record<string, unknown> }>;
      },
      req.user?.sub,
    );
  }
}
