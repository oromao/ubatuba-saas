import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePermitBusinessDto } from './dto/create-permit-business.dto';
import { UpdatePermitBusinessDto } from './dto/update-permit-business.dto';
import { PermitsBusinessService } from './permits-business.service';

@ApiTags('permits-business')
@ApiBearerAuth()
@Controller('permits-business')
export class PermitsBusinessController {
  constructor(private readonly service: PermitsBusinessService) {}

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
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreatePermitBusinessDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdatePermitBusinessDto) {
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

  @Post(':id/requirements/response')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  respondRequirement(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: { note: string },
  ) {
    return this.service.addRequirementResponse(req.tenantId, id, dto.note, req.user?.sub);
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

  @Post(':id/taxes')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addTax(@Req() req: { tenantId: string }, @Param('id') id: string, @Body() dto: { description: string; amount: number }) {
    return this.service.addTax(req.tenantId, id, dto.description, dto.amount);
  }

  @Post(':id/issue')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  issue(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.issuePermit(req.tenantId, id);
  }
}
