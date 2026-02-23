import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ValuationsService } from './valuations/valuations.service';
import { CalculateValuationDto } from './valuations/dto/calculate-valuation.dto';
import { RecalculateBatchDto } from './valuations/dto/recalculate-batch.dto';

@Controller('pgv')
export class PgvController {
  constructor(private readonly valuationsService: ValuationsService) {}

  @Post('calculate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  calculate(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: CalculateValuationDto,
  ) {
    return this.valuationsService.calculate(req.tenantId, dto, req.user?.sub);
  }

  @Post('recalculate-batch')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  recalculateBatch(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: RecalculateBatchDto,
  ) {
    return this.valuationsService.recalculateBatch(req.tenantId, dto, req.user?.sub);
  }

  @Get('report.csv')
  async reportCsv(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.valuationsService.exportCsv(req.tenantId, projectId);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Get('parcels.geojson')
  parcelsGeojson(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('bbox') bbox?: string,
  ) {
    return this.valuationsService.exportParcelsGeojson(req.tenantId, projectId, bbox);
  }
}
