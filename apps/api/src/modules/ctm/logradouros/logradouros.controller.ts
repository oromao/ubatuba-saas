import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { LogradourosService } from './logradouros.service';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('ctm/logradouros')
export class LogradourosController {
  constructor(private readonly logradourosService: LogradourosService) {}

  @Get()
  list(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.logradourosService.list(req.tenantId, projectId);
  }

  @Get(':id')
  get(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.logradourosService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Query('projectId') projectId: string | undefined,
    @Body() dto: CreateLogradouroDto,
  ) {
    return this.logradourosService.create(req.tenantId, projectId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateLogradouroDto,
  ) {
    return this.logradourosService.update(req.tenantId, projectId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.logradourosService.remove(req.tenantId, projectId, id);
  }
}
