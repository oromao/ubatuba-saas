import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ComplianceService } from './compliance.service';
import {
  UpsertArtRrtDto,
  UpsertCatDto,
  UpsertChecklistItemDto,
  UpsertCompanyDto,
  UpsertResponsibleDto,
  UpsertTeamMemberDto,
} from './dto/compliance.dto';

@ApiTags('compliance')
@ApiBearerAuth()
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Get()
  @ApiOperation({ summary: 'Obter perfil completo de conformidade' })
  getProfile(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.getProfile(req.tenantId, projectId);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Obter logs de auditoria de conformidade' })
  getAuditLogs(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.getAuditLogs(req.tenantId, projectId);
  }

  @Get('checklist')
  @ApiOperation({ summary: 'Obter checklist de conformidade' })
  getChecklist(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.getChecklist(req.tenantId, projectId);
  }

  @Put('company')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar dados da empresa responsável' })
  upsertCompany(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertCompanyDto,
  ) {
    return this.service.upsertCompany(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Post('responsibles')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Adicionar responsável técnico' })
  addResponsible(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertResponsibleDto,
  ) {
    return this.service.addResponsible(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch('responsibles/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar responsável técnico' })
  updateResponsible(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpsertResponsibleDto,
  ) {
    return this.service.updateResponsible(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete('responsibles/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Remover responsável técnico' })
  deleteResponsible(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.deleteResponsible(req.tenantId, projectId, id, req.user?.sub);
  }

  @Post('art-rrt')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Adicionar ART/RRT' })
  addArtRrt(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertArtRrtDto,
  ) {
    return this.service.addArtRrt(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch('art-rrt/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar ART/RRT' })
  updateArtRrt(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpsertArtRrtDto,
  ) {
    return this.service.updateArtRrt(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete('art-rrt/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Remover ART/RRT' })
  deleteArtRrt(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.deleteArtRrt(req.tenantId, projectId, id, req.user?.sub);
  }

  @Post('cats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Adicionar CAT' })
  addCat(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertCatDto,
  ) {
    return this.service.addCat(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch('cats/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar CAT' })
  updateCat(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpsertCatDto,
  ) {
    return this.service.updateCat(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete('cats/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Remover CAT' })
  deleteCat(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.deleteCat(req.tenantId, projectId, id, req.user?.sub);
  }

  @Post('team')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Adicionar membro à equipe' })
  addTeamMember(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertTeamMemberDto,
  ) {
    return this.service.addTeamMember(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch('team/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar membro da equipe' })
  updateTeamMember(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpsertTeamMemberDto,
  ) {
    return this.service.updateTeamMember(req.tenantId, projectId, id, dto, req.user?.sub);
  }

  @Delete('team/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Remover membro da equipe' })
  deleteTeamMember(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.deleteTeamMember(req.tenantId, projectId, id, req.user?.sub);
  }

  @Put('checklist')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  @ApiOperation({ summary: 'Atualizar item de checklist de conformidade' })
  upsertChecklist(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertChecklistItemDto,
  ) {
    return this.service.upsertChecklistItem(req.tenantId, projectId, dto, req.user?.sub);
  }
}

