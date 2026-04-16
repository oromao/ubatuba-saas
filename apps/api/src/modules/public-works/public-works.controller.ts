import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeleteResult } from 'mongoose';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddMeasurementDto } from './dto/add-measurement.dto';
import { AdvancePublicWorkDto } from './dto/advance-public-work.dto';
import { CreatePublicWorkDto } from './dto/create-public-work.dto';
import { UpdatePublicWorkDto } from './dto/update-public-work.dto';
import { PublicWorksService } from './public-works.service';

@Controller('public-works')
export class PublicWorksController {
  constructor(private readonly service: PublicWorksService) {}

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
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreatePublicWorkDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdatePublicWorkDto) {
    return this.service.update(req.tenantId, id, dto, req.user?.sub);
  }

  @Post(':id/stage')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  advanceStage(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: AdvancePublicWorkDto,
  ) {
    return this.service.advanceStage(req.tenantId, id, dto, req.user?.sub);
  }

  @Post(':id/measurements')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addMeasurement(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: AddMeasurementDto,
  ) {
    return this.service.addMeasurement(req.tenantId, id, dto, req.user?.sub);
  }

  @Post(':id/evidence')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  addEvidence(
    @Req() req: { tenantId: string; user?: { sub?: string } },
    @Param('id') id: string,
    @Body() dto: AddEvidenceDto,
  ) {
    return this.service.addEvidence(req.tenantId, id, dto, req.user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: { tenantId: string }, @Param('id') id: string): Promise<DeleteResult> {
    return this.service.remove(req.tenantId, id);
  }
}
