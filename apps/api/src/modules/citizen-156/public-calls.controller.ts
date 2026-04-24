import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/guards/public.decorator';
import { Citizen156Service } from './citizen-156.service';
import { TenantsService } from '../tenants/tenants.service';
import { Types } from 'mongoose';

type PublicCreateCallDto = {
  tenantId?: string;
  tenantSlug?: string;
  title: string;
  category: string;
  description?: string;
  reporterName?: string;
  reporterContact?: string;
  address?: string;
};

@ApiTags('public')
@Controller('public')
export class PublicCallsController {
  constructor(
    private readonly service: Citizen156Service,
    private readonly tenantsService: TenantsService,
  ) {}

  private async resolveTenantId(dto: PublicCreateCallDto) {
    if (dto.tenantSlug) {
      const tenant = await this.tenantsService.findBySlug(dto.tenantSlug);
      if (tenant?._id) return tenant._id.toString();
    }

    if (dto.tenantId) {
      const isObjectId = Types.ObjectId.isValid(dto.tenantId);
      if (isObjectId) return dto.tenantId;

      const tenantBySlug = await this.tenantsService.findBySlug(dto.tenantId);
      if (tenantBySlug?._id) return tenantBySlug._id.toString();
    }

    const demoTenant = await this.tenantsService.findBySlug('demo');
    if (demoTenant?._id) return demoTenant._id.toString();

    throw new BadRequestException('Tenant público não encontrado.');
  }

  @Public()
  @Post('calls')
  async createPublicCall(@Body() body: PublicCreateCallDto) {
    const tenantId = await this.resolveTenantId(body);
    const { description: _description, address, tenantSlug: _tenantSlug, tenantId: _tenantId, ...rest } = body;
    // Augment title with address if provided
    const title = address ? `${rest.title} — ${address}` : rest.title;
    const created = await this.service.create(
      tenantId,
      {
        ...rest,
        title,
        attachmentKeys: [],
      },
      'CIDADAO',
    );
    return {
      protocolNumber: (created as any).protocolNumber,
      status: (created as any).status,
      message: `Chamado registrado com sucesso. Protocolo: ${(created as any).protocolNumber}`,
    };
  }

  @Public()
  @Post('cidadao/solicitacoes')
  async createCitizenRequest(@Body() body: PublicCreateCallDto) {
    return this.createPublicCall(body);
  }

  @Public()
  @Get('calls/:protocol/status')
  async getCallStatus(@Param('protocol') _protocol: string) {
    return { message: 'Use o protocolo com o município para consultar o status.' };
  }
}
