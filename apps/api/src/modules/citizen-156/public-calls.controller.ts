import { BadRequestException, Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/guards/public.decorator';
import { Citizen156Service } from './citizen-156.service';
import { TenantsService } from '../tenants/tenants.service';
import { CacheService } from '../shared/cache.service';
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
    private readonly cacheService: CacheService,
  ) {}

  private async checkRateLimit(ip: string): Promise<void> {
    const key = `rate-limit:citizen:${ip}`;
    const count = (await this.cacheService.get<number>(key)) || 0;
    if (count >= 10) {
      throw new BadRequestException('Muitas solicitacoes. Tente novamente mais tarde.');
    }
    await this.cacheService.set(key, count + 1, 60); // 10 per minute
  }

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
  async createPublicCall(@Body() body: PublicCreateCallDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    await this.checkRateLimit(ip);
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
  async getCallStatus(@Param('protocol') protocol: string) {
    const call = await this.service.findByProtocol(protocol);
    if (!call) {
      return { found: false, message: 'Protocolo nao encontrado. Verifique o numero e tente novamente.' };
    }
    return {
      found: true,
      protocolNumber: call.protocolNumber,
      status: call.status,
      category: call.category,
      title: call.title,
      createdAt: (call as any).createdAt,
      history: (call.history || []).map((h: any) => ({
        status: h.status,
        message: h.message,
        date: h.createdAt,
      })),
    };
  }
}
