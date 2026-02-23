import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { UpsertParcelBuildingDto } from '../parcel-buildings/dto/upsert-parcel-building.dto';
import { UpsertParcelSocioeconomicDto } from '../parcel-socioeconomic/dto/upsert-parcel-socioeconomic.dto';
import { UpsertParcelInfrastructureDto } from '../parcel-infrastructure/dto/upsert-parcel-infrastructure.dto';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';

@Controller('api/projects/:projectId/parcels')
export class ProjectParcelsController {
  constructor(
    private readonly parcelsService: ParcelsService,
    private readonly parcelBuildingsService: ParcelBuildingsService,
    private readonly parcelSocioeconomicService: ParcelSocioeconomicService,
    private readonly parcelInfrastructureService: ParcelInfrastructureService,
  ) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('sqlu') sqlu?: string,
    @Query('inscription') inscription?: string,
    @Query('inscricaoImobiliaria') inscricaoImobiliaria?: string,
    @Query('status') status?: string,
    @Query('workflowStatus') workflowStatus?: string,
    @Query('bbox') bbox?: string,
    @Query('q') q?: string,
  ) {
    return this.parcelsService.list(req.tenantId, projectId, {
      sqlu,
      inscription,
      inscricaoImobiliaria,
      status,
      workflowStatus,
      bbox,
      q,
    });
  }

  @Get('pendencias')
  pending(@Req() req: { tenantId: string }, @Param('projectId') projectId: string) {
    return this.parcelsService.listPendencias(req.tenantId, projectId);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Query('sqlu') sqlu?: string,
    @Query('inscription') inscription?: string,
    @Query('inscricaoImobiliaria') inscricaoImobiliaria?: string,
    @Query('status') status?: string,
    @Query('workflowStatus') workflowStatus?: string,
    @Query('bbox') bbox?: string,
    @Query('q') q?: string,
  ) {
    return this.parcelsService.geojson(req.tenantId, projectId, {
      sqlu,
      inscription,
      inscricaoImobiliaria,
      status,
      workflowStatus,
      bbox,
      q,
    });
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('projectId') projectId: string, @Param('id') id: string) {
    return this.parcelsService.findById(req.tenantId, projectId, id);
  }

  @Get(':id/summary')
  summary(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.parcelsService.getSummary(req.tenantId, projectId, id);
  }

  @Get(':id/history')
  history(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.parcelsService.getHistory(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Body() dto: CreateParcelDto,
  ) {
    return this.parcelsService.create(req.tenantId, { ...dto, projectId }, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateParcelDto,
  ) {
    return this.parcelsService.update(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.parcelsService.remove(req.tenantId, projectId, id);
  }

  @Put(':id/building')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  upsertBuilding(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpsertParcelBuildingDto,
  ) {
    return this.parcelBuildingsService.upsert(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Put(':id/socioeconomic')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  upsertSocioeconomic(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpsertParcelSocioeconomicDto,
  ) {
    return this.parcelSocioeconomicService.upsert(
      req.tenantId,
      projectId,
      id,
      dto,
      req.user?.sub,
    );
  }

  @Put(':id/infrastructure')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  upsertInfrastructure(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpsertParcelInfrastructureDto,
  ) {
    return this.parcelInfrastructureService.upsert(
      req.tenantId,
      projectId,
      id,
      dto,
      req.user?.sub,
    );
  }

  @Post('import')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  importGeojson(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('projectId') projectId: string,
    @Body() featureCollection: { type: 'FeatureCollection'; features: unknown[] },
  ) {
    return this.parcelsService.importGeojson(
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
