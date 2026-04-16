import { Controller, Get, Query, Req } from '@nestjs/common';
import { ObservatoryService } from './observatory.service';

@Controller('observatory')
export class ObservatoryController {
  constructor(private readonly service: ObservatoryService) {}

  @Get('market')
  market(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('focus') focus?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('street') street?: string,
    @Query('zoneId') zoneId?: string,
    @Query('compare') compare?: 'all' | 'city' | 'zone' | 'street',
  ) {
    return this.service.marketOverview(req.tenantId, projectId, focus, {
      neighborhood,
      street,
      zoneId,
      compare,
    });
  }

  @Get('market/export.csv')
  exportMarketCsv(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('focus') focus?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('street') street?: string,
    @Query('zoneId') zoneId?: string,
    @Query('compare') compare?: 'all' | 'city' | 'zone' | 'street',
  ) {
    return this.service.exportMarketCsv(req.tenantId, projectId, focus, {
      neighborhood,
      street,
      zoneId,
      compare,
    });
  }
}
