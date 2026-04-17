import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive')
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Gera relatório executivo consolidado' })
  async getExecutiveReport(@Req() req: any) {
    return this.reportsService.executivoReport(req.tenantId);
  }

  @Get('fiscalizacao')
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Relatório de vistorias e fiscalização' })
  async getFiscalizacaoReport(
    @Req() req: any,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.fiscalizacaoReport(req.tenantId, {
      dataInicio,
      dataFim,
      status,
    });
  }

  @Get('parcels')
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Relatório de situação cadastral de parcelas' })
  async getParcelsReport(@Req() req: any) {
    return this.reportsService.parcelasReport(req.tenantId);
  }
}
