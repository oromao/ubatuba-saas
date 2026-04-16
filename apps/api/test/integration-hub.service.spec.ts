import { IntegrationHubService } from '../src/modules/integration-hub/integration-hub.service';

describe('IntegrationHubService', () => {
  const projectsService: any = { resolveProjectId: jest.fn().mockResolvedValue('64f000000000000000000001') };
  const authService: any = {
    createPortalLinkPayload: jest.fn().mockReturnValue({ signedToken: 'token', expiresInMinutes: 10 }),
    createOidcAuthorizeUrl: jest.fn().mockReturnValue({
      code: 'code',
      state: 'state',
      redirectUri: '/portal/oidc/callback',
      href: '/portal/oidc/callback?code=code&state=state',
      expiresInSeconds: 120,
    }),
  };
  const cacheService: any = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
  const service = new IntegrationHubService(projectsService, authService, cacheService);

  it('lists portal adapters and links', async () => {
    const adapters = (await service.listAdapters('tenant')) as any;
    expect(adapters.adapters).toBeDefined();
    expect(adapters.adapters.some((a: any) => a.id === 'certidoes')).toBe(true);
    expect(adapters.oidcReady).toBe(true);
    const links = (await service.portalLinks('tenant')) as any;
    expect(links.links.some((l: any) => l.href === '/app/certidoes')).toBe(true);
    expect(links.exchangeTemplate).toContain('/portal/exchange');
    const portal = service.createPortalLink({
      email: 'cidadao@demo.local',
      tenantSlug: 'demo',
      target: '/app/certidoes',
    }) as any;
    expect(portal.href).toContain('/portal/exchange');
    const oidc = service.createOidcLink({
      email: 'cidadao@demo.local',
      tenantSlug: 'demo',
      target: '/app/dashboard',
    }) as any;
    expect(oidc.href).toContain('/portal/oidc/callback');
  });
});
