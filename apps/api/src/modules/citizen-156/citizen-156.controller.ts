import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCitizenCallDto } from './dto/create-citizen-call.dto';
import { UpdateCitizenCallDto } from './dto/update-citizen-call.dto';
import { Citizen156Service } from './citizen-156.service';

@ApiTags('citizen-156')
@ApiBearerAuth()
@Controller('citizen-156')
export class Citizen156Controller {
  constructor(private readonly service: Citizen156Service) {}

  @Get('calls')
  list(@Req() req: { tenantId: string }) {
    return this.service.list(req.tenantId);
  }

  @Get('summary')
  summary(@Req() req: { tenantId: string }) {
    return this.service.summary(req.tenantId);
  }

  @Get('calls/:id')
  get(@Req() req: { tenantId: string }, @Param('id') id: string) {
    return this.service.findById(req.tenantId, id);
  }

  @Post('calls')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  create(@Req() req: { tenantId: string; user?: { sub?: string } }, @Body() dto: CreateCitizenCallDto) {
    return this.service.create(req.tenantId, dto, req.user?.sub);
  }

  @Patch('calls/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR', 'OPERADOR')
  update(@Req() req: { tenantId: string; user?: { sub?: string } }, @Param('id') id: string, @Body() dto: UpdateCitizenCallDto) {
    return this.service.update(req.tenantId, id, dto, req.user?.sub);
  }
}
