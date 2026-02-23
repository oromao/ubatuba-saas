import { Body, Controller, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { FactorSetsService } from './factor-sets.service';
import { UpdateFactorSetDto } from './dto/update-factor-set.dto';

@Controller('pgv/factor-sets')
export class FactorSetsController {
  constructor(private readonly factorSetsService: FactorSetsService) {}

  @Get()
  get(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.factorSetsService.get(req.tenantId, projectId);
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Body() dto: UpdateFactorSetDto,
  ) {
    return this.factorSetsService.update(req.tenantId, dto, req.user?.sub);
  }
}
