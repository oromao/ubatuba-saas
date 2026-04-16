import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeleteResult } from 'mongoose';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCemeteryPlotDto } from './dto/create-cemetery-plot.dto';
import { UpdateCemeteryPlotDto } from './dto/update-cemetery-plot.dto';
import { CemeteryService } from './cemetery.service';

@Controller('cemetery')
export class CemeteryController {
  constructor(private readonly service: CemeteryService) {}

  @Get()
  list(@Req() req: { tenantId: string }) {
    return this.service.list(req.tenantId);
  }

  @Get('summary')
  summary(@Req() req: { tenantId: string }) {
    return this.service.summary(req.tenantId);
  }

  @Get(':id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateCemeteryPlotDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateCemeteryPlotDto) {
    return this.service.update(req.tenantId, id, dto, req.user?.sub);
  }

  @Post(':id/documents')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addDocuments(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: { keys: string[] },
  ) {
    return this.service.addDocumentKeys(req.tenantId, id, dto.keys, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: { tenantId: string }, @Param('id') id: string): Promise<DeleteResult> {
    return this.service.remove(req.tenantId, id);
  }
}
