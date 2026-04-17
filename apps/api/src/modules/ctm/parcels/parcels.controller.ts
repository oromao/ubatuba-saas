import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ImportGeojsonDto, ImportEnrichmentCsvDto } from './dto/import-parcel.dto';
import { UpsertParcelBuildingDto } from '../parcel-buildings/dto/upsert-parcel-building.dto';
import { UpsertParcelSocioeconomicDto } from '../parcel-socioeconomic/dto/upsert-parcel-socioeconomic.dto';
import { UpsertParcelInfrastructureDto } from '../parcel-infrastructure/dto/upsert-parcel-infrastructure.dto';
import { GeometryService } from '../geometry.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';

@Controller('ctm/parcels')
export class ParcelsController {
  constructor(
    private readonly parcelsService: ParcelsService,
    private readonly parcelBuildingsService: ParcelBuildingsService,
    private readonly parcelSocioeconomicService: ParcelSocioeconomicService,
    private readonly parcelInfrastructureService: ParcelInfrastructureService,
    private readonly geometryService: GeometryService,
  ) {}

  @Post('validate-geometry')
  validateGeometry(@Body() body: { geometry: any }) {
    return this.geometryService.validateGeometry(body.geometry);
  }

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('sqlu') sqlu?: string,
    @Query('inscription') inscription?: string,
    @Query('inscricaoImobiliaria') inscricaoImobiliaria?: string,
    @Query('status') status?: string,
    @Query('workflowStatus') workflowStatus?: string,
    @Query('bbox') bbox?: string,
    @Query('q') q?: string,
    @Query('sourceType') sourceType?: string,
    @Query('isOfficial') isOfficial?: string,
    @Query('zoneamento') zoneamento?: string,
    @Query('statusIPTU') statusIPTU?: string,
  ) {
    return this.parcelsService.list(req.tenantId, projectId, {
      sqlu,
      inscription,
      inscricaoImobiliaria,
      status,
      workflowStatus,
      bbox,
      q,
      sourceType,
      isOfficial: isOfficial === 'true' ? true : isOfficial === 'false' ? false : undefined,
      zoneamento,
      statusIPTU,
    });
  }

  @Get('statistics')
  statistics(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.parcelsService.getStatistics(req.tenantId, projectId);
  }

  @Get('pendencias')
  pending(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.parcelsService.listPendencias(req.tenantId, projectId);
  }

  @Get('geojson')
  geojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('sqlu') sqlu?: string,
    @Query('inscription') inscription?: string,
    @Query('inscricaoImobiliaria') inscricaoImobiliaria?: string,
    @Query('status') status?: string,
    @Query('workflowStatus') workflowStatus?: string,
    @Query('bbox') bbox?: string,
    @Query('q') q?: string,
    @Query('sourceType') sourceType?: string,
    @Query('isOfficial') isOfficial?: string,
  ) {
    return this.parcelsService.geojson(req.tenantId, projectId, {
      sqlu,
      inscription,
      inscricaoImobiliaria,
      status,
      workflowStatus,
      bbox,
      q,
      sourceType,
      isOfficial: isOfficial === 'true' ? true : isOfficial === 'false' ? false : undefined,
    });
  }

  @Get('tiles/:z/:x/:y.pbf')
  async mvt(
    @Req() req: { tenantId: string },
    @Res() res: Response,
    @Param('z') z: string,
    @Param('x') x: string,
    @Param('y') y: string,
    @Query('projectId') projectId?: string,
  ) {
    const buffer = await this.parcelsService.vectorTiles(
      req.tenantId,
      projectId,
      parseInt(z, 10),
      parseInt(x, 10),
      parseInt(y, 10),
    );
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  }

  @Get(':id/pdf')
  async getPdf(
    @Param('id') id: string,
    @Req() req: { tenantId: string },
    @Res() res: Response,
  ) {
    const buffer = await this.parcelsService.generatePdf(req.tenantId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="lote-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string, @Query('projectId') projectId?: string) {
    return this.parcelsService.findById(req.tenantId, projectId, id);
  }

  @Get(':id/summary')
  summary(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.parcelsService.getSummary(req.tenantId, projectId, id);
  }

  @Get(':id/history')
  history(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.parcelsService.getHistory(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateParcelDto) {
    return this.parcelsService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateParcelDto,
  ) {
    return this.parcelsService.update(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.parcelsService.remove(req.tenantId, projectId, id);
  }

  @Put(':id/building')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  upsertBuilding(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertParcelBuildingDto,
  ) {
    return this.parcelBuildingsService.upsert(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Put(':id/socioeconomic')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  upsertSocioeconomic(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
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
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
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
    @Query('projectId') projectId: string | undefined,
    @Body() body: ImportGeojsonDto & {
      municipalityName?: string;
      municipalityCode?: string;
    },
  ) {
    return this.parcelsService.importGeojson(
      req.tenantId,
      projectId,
      body.data as {
        type: 'FeatureCollection';
        features: Array<{ type: 'Feature'; id?: string; geometry: unknown; properties: Record<string, unknown> }>;
      },
      body.sourceType || 'GEOJSON',
      body.fileName,
      body.upsert || false,
      req.user?.sub,
      body.municipalityName,
      body.municipalityCode,
    );
  }

  @Post('import-enrichment')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  importEnrichment(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() body: ImportEnrichmentCsvDto,
  ) {
    return this.parcelsService.importFromCsvEnrichment(
      req.tenantId,
      projectId,
      body.csv,
      body.sourceType || 'CSV_ENRICHMENT',
      body.fileName,
      body.columnMapping ? (body.columnMapping as Record<string, string>) : undefined,
      req.user?.sub,
    );
  }

  @Post('import-csv')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  importCsv(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() body: { csv: string },
  ) {
    return this.parcelsService.importFromCsvEnrichment(req.tenantId, projectId, body.csv, 'CSV_ENRICHMENT', undefined, undefined, req.user?.sub);
  }

  @Post(':id/transicao')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  transicao(
    @Req() req: { tenantId: string; user?: { sub?: string; role?: string } },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() body: { status: string; observacao: string },
  ) {
    const validStatuses = ['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'REPROVADA'] as const;
    if (!validStatuses.includes(body.status as any)) {
      throw new Error('Status invalido');
    }
    return this.parcelsService.transicao(
      req.tenantId,
      projectId,
      id,
      body.status as 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA',
      body.observacao,
      req.user?.sub,
      req.user?.role,
    );
  }
}
