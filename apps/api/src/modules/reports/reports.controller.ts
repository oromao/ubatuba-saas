import { Controller, Get, Query, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('fiscalizacao')
  fiscalizacao(
    @Req() req: { tenantId: string },
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
  ) {
    return this.service.fiscalizacaoReport(req.tenantId, { dataInicio, dataFim, status });
  }

  @Get('parcelas')
  parcelas(@Req() req: { tenantId: string }) {
    return this.service.parcelasReport(req.tenantId);
  }

  @Get('executivo')
  executivo(@Req() req: { tenantId: string }) {
    return this.service.executivoReport(req.tenantId);
  }
}
