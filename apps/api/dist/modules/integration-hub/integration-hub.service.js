"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationHubService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const projects_service_1 = require("../projects/projects.service");
const cache_service_1 = require("../shared/cache.service");
let IntegrationHubService = class IntegrationHubService {
    constructor(projectsService, authService, cacheService) {
        this.projectsService = projectsService;
        this.authService = authService;
        this.cacheService = cacheService;
        this.adapters = [
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
    }
    async listAdapters(tenantId, projectId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const cacheKey = `integration-hub:${tenantId}:${resolvedProjectId}:adapters`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
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
    async portalLinks(tenantId, projectId) {
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
    createPortalLink(input) {
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
    createOidcLink(input) {
        const exchange = this.authService.createOidcAuthorizeUrl(input);
        return {
            ...exchange,
            href: exchange.href,
            target: input.target ?? '/app/dashboard',
        };
    }
};
exports.IntegrationHubService = IntegrationHubService;
exports.IntegrationHubService = IntegrationHubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        auth_service_1.AuthService,
        cache_service_1.CacheService])
], IntegrationHubService);
//# sourceMappingURL=integration-hub.service.js.map