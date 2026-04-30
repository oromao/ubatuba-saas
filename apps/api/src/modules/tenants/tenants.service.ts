import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateMunicipalConfigDto } from './dto/update-municipal-config.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  create(dto: CreateTenantDto) {
    return this.tenantsRepository.create(dto);
  }

  findById(id: string) {
    return this.tenantsRepository.findById(id);
  }

  findBySlug(slug: string) {
    return this.tenantsRepository.findBySlug(slug);
  }

  async getMunicipalConfig(tenantId: string) {
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant nao encontrado');
    return tenant.municipalConfig || {};
  }

  async updateMunicipalConfig(tenantId: string, dto: UpdateMunicipalConfigDto) {
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant nao encontrado');
    const config = (tenant.municipalConfig as any) || {};
    const merged = { ...config, ...dto };
    tenant.municipalConfig = merged as any;
    await this.tenantsRepository.save(tenant);
    return tenant.municipalConfig || {};
  }

  async getAliquotasPadrao(tenantId: string) {
    const tenant = await this.tenantsRepository.findById(tenantId);
    if (!tenant) return {};
    return tenant.municipalConfig?.aliquotasPadrao || {};
  }
}
