import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProcessDto } from './dto/create-process.dto';
import { TransitionDto } from './dto/transition.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesService } from './processes.service';

@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.processesService.list(req.tenantId);
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.processesService.findById(req.tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string }, @Body() dto: CreateProcessDto) {
    return this.processesService.create(req.tenantId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateProcessDto,
  ) {
    return this.processesService.update(req.tenantId, id, dto);
  }

  @Post(':id/transition')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  transition(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: TransitionDto,
  ) {
    return this.processesService.transition(req.tenantId, id, dto);
  }

  @Get(':id/events')
  events(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.processesService.events(req.tenantId, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.processesService.remove(req.tenantId, id);
  }
}
