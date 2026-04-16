import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEnvironmentEventDto } from './dto/create-environment-event.dto';
import { UpdateEnvironmentEventDto } from './dto/update-environment-event.dto';
import { MonitoringService } from './monitoring.service';

@ApiTags('monitoring')
@ApiBearerAuth()
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly service: MonitoringService) {}

  @Get('events')
  list(
    @Req() req: { tenantId: string },
    @Query('stage') stage?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('sourceMode') sourceMode?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.service.list(req.tenantId, { stage, severity, type, sourceMode, assignedTo });
  }

  @Post('events')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  ingest(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateEnvironmentEventDto) {
    return this.service.ingest(req.tenantId, dto, req.user?.sub);
  }

  @Get('events/:id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Patch('events/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  advance(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateEnvironmentEventDto) {
    return this.service.advance(req.tenantId, id, dto, req.user?.sub);
  }

  @Post('events/:id/triage')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  triage(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateEnvironmentEventDto) {
    return this.service.triage(req.tenantId, id, dto, req.user?.sub);
  }

  @Post('events/:id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  assign(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: { assignedTo: string }) {
    return this.service.assign(req.tenantId, id, dto.assignedTo, req.user?.sub);
  }

  @Post('events/:id/notify')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  notify(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateEnvironmentEventDto) {
    return this.service.notify(req.tenantId, id, dto, req.user?.sub);
  }

  @Post('events/:id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  close(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateEnvironmentEventDto) {
    return this.service.close(req.tenantId, id, dto, req.user?.sub);
  }

  @Get('dashboard')
  dashboard(
    @Req() req: { tenantId: string },
    @Query('stage') stage?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('sourceMode') sourceMode?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.service.dashboard(req.tenantId, { stage, severity, type, sourceMode, assignedTo });
  }
}
