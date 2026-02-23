import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.alertsService.list(req.tenantId);
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.alertsService.findById(req.tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string }, @Body() dto: CreateAlertDto) {
    return this.alertsService.create(req.tenantId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
  ) {
    return this.alertsService.update(req.tenantId, id, dto);
  }

  @Post(':id/ack')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  ack(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.alertsService.ack(req.tenantId, id);
  }

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  resolve(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.alertsService.resolve(req.tenantId, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.alertsService.remove(req.tenantId, id);
  }
}
