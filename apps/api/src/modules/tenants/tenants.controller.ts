import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateMunicipalConfigDto } from './dto/update-municipal-config.dto';
import { TenantsService } from './tenants.service';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get('me')
  async getMe(@Req() req: { tenantId?: string }) {
    if (!req.tenantId) return null;
    return this.tenantsService.findById(req.tenantId);
  }

  @Get('municipal-config')
  async getMunicipalConfig(@Req() req: { tenantId?: string }) {
    if (!req.tenantId) return {};
    return this.tenantsService.getMunicipalConfig(req.tenantId);
  }

  @Put('municipal-config')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  async updateMunicipalConfig(@Req() req: { tenantId?: string }, @Body() dto: UpdateMunicipalConfigDto) {
    if (!req.tenantId) throw new Error('Tenant nao identificado');
    return this.tenantsService.updateMunicipalConfig(req.tenantId, dto);
  }
}
