"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const integration_hub_service_1 = require("../src/modules/integration-hub/integration-hub.service");
describe('IntegrationHubService', () => {
    const projectsService = { resolveProjectId: jest.fn().mockResolvedValue('64f000000000000000000001') };
    const authService = {
        createPortalLinkPayload: jest.fn().mockReturnValue({ signedToken: 'token', expiresInMinutes: 10 }),
        createOidcAuthorizeUrl: jest.fn().mockReturnValue({
            code: 'code',
            state: 'state',
            redirectUri: '/portal/oidc/callback',
            href: '/portal/oidc/callback?code=code&state=state',
            expiresInSeconds: 120,
        }),
    };
    const cacheService = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
    const service = new integration_hub_service_1.IntegrationHubService(projectsService, authService, cacheService);
    it('lists portal adapters and links', async () => {
        const adapters = (await service.listAdapters('tenant'));
        expect(adapters.adapters).toBeDefined();
        expect(adapters.adapters.some((a) => a.id === 'certidoes')).toBe(true);
        expect(adapters.oidcReady).toBe(true);
        const links = (await service.portalLinks('tenant'));
        expect(links.links.some((l) => l.href === '/app/certidoes')).toBe(true);
        expect(links.exchangeTemplate).toContain('/portal/exchange');
        const portal = service.createPortalLink({
            email: 'cidadao@demo.local',
            tenantSlug: 'demo',
            target: '/app/certidoes',
        });
        expect(portal.href).toContain('/portal/exchange');
        const oidc = service.createOidcLink({
            email: 'cidadao@demo.local',
            tenantSlug: 'demo',
            target: '/app/dashboard',
        });
        expect(oidc.href).toContain('/portal/oidc/callback');
    });
});
//# sourceMappingURL=integration-hub.service.spec.js.map