import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  getProfile(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.getProfile(req.tenantId, projectId);
  }

  @Put('company')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
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
  upsertChecklist(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpsertChecklistItemDto,
  ) {
    return this.service.upsertChecklistItem(req.tenantId, projectId, dto, req.user?.sub);
  }
}

