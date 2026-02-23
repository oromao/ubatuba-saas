import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ValuationsService } from './valuations.service';
import { CalculateValuationDto } from './dto/calculate-valuation.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('pgv/valuations')
export class ValuationsController {
  constructor(private readonly valuationsService: ValuationsService) {}

  @Get()
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.valuationsService.list(req.tenantId, projectId);
  }

  @Get('parcel/:id')
  byParcel(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.valuationsService.byParcel(req.tenantId, projectId, id);
  }

  @Get('parcel/:id/trace')
  trace(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.valuationsService.getCalculationTrace(req.tenantId, projectId, id);
  }

  @Post('calculate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  calculate(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CalculateValuationDto,
  ) {
    return this.valuationsService.calculate(req.tenantId, dto, req.user?.sub);
  }

  @Get('export/csv')
  async exportCsv(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.valuationsService.exportCsv(req.tenantId, projectId);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Get('export/geojson')
  exportGeojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.valuationsService.exportParcelsGeojson(req.tenantId, projectId, bbox);
  }

  @Get('impact-report')
  impactReport(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Query('baseVersionId') baseVersionId: string,
    @Query('targetVersionId') targetVersionId: string,
  ) {
    return this.valuationsService.getImpactReport(
      req.tenantId,
      projectId,
      baseVersionId,
      targetVersionId,
    );
  }
}
