import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis(@Req() req: { tenantId: string }) {
    return this.dashboardService.getKpis(req.tenantId);
  }

  @Get('executive')
  getExecutive(@Req() req: { tenantId: string; user?: { sub?: string } }) {
    return this.dashboardService.getExecutive(req.tenantId, req.user?.sub ?? 'anonymous');
  }

  @Get('layout')
  getLayout(@Req() req: { tenantId: string; user?: { sub?: string } }) {
    return this.dashboardService.getLayout(req.tenantId, req.user?.sub ?? 'anonymous');
  }

  @Patch('layout')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  saveLayout(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() body: { viewMode?: 'executive' | 'operational'; widgets: Array<{ id: string; visible: boolean; order: number }> }) {
    return this.dashboardService.saveLayout(req.tenantId, req.user?.sub ?? 'anonymous', body);
  }
}
