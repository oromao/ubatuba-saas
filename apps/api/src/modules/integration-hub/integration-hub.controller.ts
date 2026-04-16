import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { IntegrationHubService } from './integration-hub.service';
import { OidcAuthorizeDto } from '../auth/dto/oidc-authorize.dto';

@Controller('integration-hub')
export class IntegrationHubController {
  constructor(private readonly service: IntegrationHubService) {}

  @Get('adapters')
  listAdapters(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.listAdapters(req.tenantId, projectId);
  }

  @Get('portal-links')
  portalLinks(@Req() req: { tenantId: string }, @Query('projectId') projectId?: string) {
    return this.service.portalLinks(req.tenantId, projectId);
  }

  @Post('portal-link')
  createPortalLink(
    @Req() req: { tenantId: string },
    @Body() body: { email: string; tenantSlug?: string; roleHint?: string; target?: string; context?: Record<string, unknown> },
    @Query('projectId') projectId?: string,
  ) {
    return this.service.createPortalLink({
      email: body.email,
      tenantSlug: body.tenantSlug ?? req.tenantId,
      roleHint: body.roleHint,
      target: body.target,
      context: { ...body.context, projectId },
    });
  }

  @Post('oidc-link')
  createOidcLink(
    @Req() req: { tenantId: string },
    @Body() body: OidcAuthorizeDto & { target?: string; context?: Record<string, unknown> },
    @Query('projectId') projectId?: string,
  ) {
    return this.service.createOidcLink({
      ...body,
      tenantSlug: body.tenantSlug ?? req.tenantId,
      context: { ...body.context, projectId },
      target: body.target,
    });
  }
}
