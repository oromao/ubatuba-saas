import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('pgv/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.versionsService.list(req.tenantId, projectId);
  }

  @Get('active')
  active(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.versionsService.getActiveOrDefault(req.tenantId, projectId);
  }

  @Get(':id')
  get(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.versionsService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateVersionDto) {
    return this.versionsService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.versionsService.update(req.tenantId, projectId, id, dto);
  }
}
