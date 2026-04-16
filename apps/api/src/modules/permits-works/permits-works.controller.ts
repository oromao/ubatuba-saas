import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePermitWorkDto } from './dto/create-permit-work.dto';
import { UpdatePermitWorkDto } from './dto/update-permit-work.dto';
import { PermitsWorksService } from './permits-works.service';

@ApiTags('permits-works')
@ApiBearerAuth()
@Controller('permits-works')
export class PermitsWorksController {
  constructor(private readonly service: PermitsWorksService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.service.list(req.tenantId);
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreatePermitWorkDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdatePermitWorkDto) {
    return this.service.update(req.tenantId, id, dto, req.user?.sub);
  }

  @Post(':id/evidences')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addEvidence(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: { title: string; note?: string; fileName?: string },
  ) {
    return this.service.addEvidence(req.tenantId, id, dto.title, dto.note, dto.fileName, req.user?.sub);
  }

  @Post(':id/requirements/:requirementId/response')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  respondRequirement(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Param('requirementId') requirementId: string,
    @Body() dto: { note: string },
  ) {
    return this.service.addRequirementResponse(req.tenantId, id, requirementId, dto.note, req.user?.sub);
  }

  @Post(':id/decision')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  decide(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: { decision: 'DEFERIDO' | 'INDEFERIDO' | 'DEVOLVIDO'; reason?: string },
  ) {
    return this.service.decide(req.tenantId, id, dto.decision, dto.reason, req.user?.sub);
  }

  @Post(':id/invoices')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addInvoice(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: { description: string; amount: number },
  ) {
    return this.service.addInvoice(req.tenantId, id, dto.description, dto.amount);
  }

  @Post(':id/issue')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  issue(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.issueDecisionPdf(req.tenantId, id);
  }
}
