import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreatePgvScenarioDto } from './dto/create-pgv-scenario.dto';
import { PgvSimulationsService } from './pgv-simulations.service';

@Controller('pgv/simulations')
export class PgvSimulationsController {
  constructor(private readonly simulationsService: PgvSimulationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  simulate(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreatePgvScenarioDto) {
    return this.simulationsService.simulate(req.tenantId, dto, req.user?.sub);
  }

  @Get()
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.simulationsService.listScenarios(req.tenantId, projectId);
  }
}
