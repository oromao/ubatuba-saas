import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { LgpdAuditService } from '../../common/services/lgpd-audit.service';
import { TenantRequest } from '../../common/guards/tenant.guard';

@Controller('lgpd')
export class LgpdController {
  constructor(private readonly audit: LgpdAuditService) {}

  @Post('consent')
  @HttpCode(HttpStatus.CREATED)
  async recordConsent(
    @Body() body: { resourceType: string; resourceId: string; fields?: string[]; consentId?: string },
    @Req() req: TenantRequest,
  ) {
    await this.audit.logAccess({
      tenantId: req.tenantId || 'public',
      action: 'CONSENT_RECORDED',
      resourceType: body.resourceType as any,
      resourceId: body.resourceId,
      fields: body.fields,
      ipAddress: req.ip,
      consentId: body.consentId,
      reason: 'Consentimento explicito do titular (art. 7 LGPD)',
    });
    return { recorded: true, message: 'Consentimento registrado conforme art. 7 LGPD' };
  }

  @Post('delete-request')
  @HttpCode(HttpStatus.CREATED)
  async requestDeletion(
    @Body() body: { resourceType: string; resourceId: string; reason?: string },
    @Req() req: TenantRequest,
  ) {
    await this.audit.logAccess({
      tenantId: req.tenantId || 'public',
      action: 'DELETE_PERSONAL_DATA',
      resourceType: body.resourceType as any,
      resourceId: body.resourceId,
      ipAddress: req.ip,
      reason: body.reason || 'Direito ao esquecimento (art. 18 LGPD)',
    });

    await this.audit.anonymize(
      req.tenantId || 'public',
      body.resourceType,
      body.resourceId,
    );

    return {
      message: 'Solicitação de anonimização registrada. Seus dados serão anonimizados em até 15 dias úteis (art. 18 §2 LGPD).',
      protocol: `LGPD-${Date.now().toString(36)}`,
    };
  }

  @Get('audit/:tenantId')
  async getAuditTrail(
    @Param('tenantId') tenantId: string,
    @Req() req: TenantRequest,
  ) {
    const entries = await this.audit.query({ tenantId });
    return { tenantId, entries, total: entries.length };
  }

  @Get('audit/:tenantId/count')
  async getAuditCount(@Param('tenantId') tenantId: string) {
    const total = await this.audit.countByTenant(tenantId);
    return { tenantId, total };
  }
}
