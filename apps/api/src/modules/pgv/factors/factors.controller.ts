import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FactorsService } from './factors.service';
import { CreateFactorDto } from './dto/create-factor.dto';
import { UpdateFactorDto } from './dto/update-factor.dto';
import { Roles } from '../../../common/guards/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('pgv/factors')
export class FactorsController {
  constructor(private readonly factorsService: FactorsService) {}

  @Get()
  list(
    @Req() req: { tenantId: string },
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
  ) {
    return this.factorsService.list(req.tenantId, projectId, category);
  }

  @Get(':id')
  get(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.factorsService.findById(req.tenantId, projectId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateFactorDto) {
    return this.factorsService.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId: string | undefined,
    @Body() dto: UpdateFactorDto,
  ) {
    return this.factorsService.update(req.tenantId, projectId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(
    @Req() req: { tenantId: string },
    @Param('id') id: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.factorsService.remove(req.tenantId, projectId, id);
  }
}
