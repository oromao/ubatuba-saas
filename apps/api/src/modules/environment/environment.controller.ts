import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEnvironmentCaseDto } from './dto/create-environment-case.dto';
import { UpdateEnvironmentCaseDto } from './dto/update-environment-case.dto';
import { EnvironmentService } from './environment.service';

@ApiTags('environment')
@ApiBearerAuth()
@Controller('environment')
export class EnvironmentController {
  constructor(private readonly service: EnvironmentService) {}

  @Get('cases')
  list(@Req() req: { tenantId: string }) {
    return this.service.list(req.tenantId);
  }

  @Get('summary')
  summary(@Req() req: { tenantId: string }) {
    return this.service.summary(req.tenantId);
  }

  @Get('cases/:id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Post('cases')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateEnvironmentCaseDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch('cases/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateEnvironmentCaseDto) {
    return this.service.update(req.tenantId, id, dto, req.user?.sub);
  }

  @Post('cases/:id/report')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  issueReport(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.issueReport(req.tenantId, id);
  }
}
