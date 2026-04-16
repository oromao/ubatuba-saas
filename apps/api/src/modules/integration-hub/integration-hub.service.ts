import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { OidcAuthorizeDto } from '../auth/dto/oidc-authorize.dto';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';

type PortalAdapter = {
  id: string;
  label: string;
  mode: 'DEEPLINK' | 'SSO' | 'API' | 'MANUAL';
  description: string;
  target: string;
};

@Injectable()
export class IntegrationHubService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {}

  private adapters: PortalAdapter[] = [
    {
      id: 'certidoes',
      label: 'Certidões online',
      mode: 'DEEPLINK',
      description: 'Abre a área de certidões sem duplicar o fluxo do portal.',
      target: '/app/certidoes',
    },
    {
      id: 'processos',
      label: 'Consulta de processos',
      mode: 'DEEPLINK',
      description: 'Redireciona para consulta interna de tramitação.',
      target: '/app/processes',
    },
    {
      id: 'validacao-certidao',
      label: 'Validação pública de certidão',
      mode: 'API',
      description: 'Endpoint público para hash/código de validação.',
      target: '/certificates/validate',
    },
    {
      id: 'tributario',
      label: 'Integração tributária',
      mode: 'API',
      description: 'Conectores e sincronização de cadastro/fiscal.',
      target: '/tax-integration/connectors',
    },
    {
      id: 'mobile-field',
      label: 'Mobilidade em campo',
      mode: 'DEEPLINK',
      description: 'Abre a PWA de fiscalização em campo.',
      target: '/mobile',
    },
    {
      id: 'portal-oidc',
      label: 'Portal cidadão (OIDC homologação)',
      mode: 'SSO',
      description: 'Fluxo OIDC-ready para handoff institucional com callback e logout.',
      target: '/portal/oidc/start',
    },
  ];

  async listAdapters(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const cacheKey = `integration-hub:${tenantId}:${resolvedProjectId}:adapters`;
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached) return cached;
    const result = {
      tenantId,
      projectId: String(resolvedProjectId),
      adapters: this.adapters,
      strategy: 'Não duplicar portal. Integrar por deep link, API e futura camada SSO.',
      oidcReady: true,
    };
    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  async portalLinks(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return {
      tenantId,
      projectId: String(resolvedProjectId),
      links: this.adapters.map((adapter) => ({
        id: adapter.id,
        label: adapter.label,
        href: adapter.target,
        mode: adapter.mode,
      })),
      exchangeTemplate: '/portal/exchange?token={signedToken}&next={target}',
    };
  }

  createPortalLink(input: {
    email: string;
    tenantSlug: string;
    roleHint?: string;
    target?: string;
    context?: Record<string, unknown>;
  }) {
    const exchange = this.authService.createPortalLinkPayload({
      email: input.email,
      tenantSlug: input.tenantSlug,
      roleHint: input.roleHint,
      context: input.context,
    });

    return {
      signedToken: exchange.signedToken,
      expiresInMinutes: exchange.expiresInMinutes,
      href: `/portal/exchange?token=${encodeURIComponent(exchange.signedToken)}&next=${encodeURIComponent(input.target ?? '/app/dashboard')}`,
    };
  }

  createOidcLink(input: OidcAuthorizeDto & { target?: string }) {
    const exchange = this.authService.createOidcAuthorizeUrl(input);
    return {
      ...exchange,
      href: exchange.href,
      target: input.target ?? '/app/dashboard',
    };
  }
}
