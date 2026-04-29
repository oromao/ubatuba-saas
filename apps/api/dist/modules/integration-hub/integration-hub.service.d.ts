import { AuthService } from '../auth/auth.service';
import { OidcAuthorizeDto } from '../auth/dto/oidc-authorize.dto';
import { ProjectsService } from '../projects/projects.service';
import { CacheService } from '../shared/cache.service';
export declare class IntegrationHubService {
    private readonly projectsService;
    private readonly authService;
    private readonly cacheService;
    constructor(projectsService: ProjectsService, authService: AuthService, cacheService: CacheService);
    private adapters;
    listAdapters(tenantId: string, projectId?: string): Promise<{}>;
    portalLinks(tenantId: string, projectId?: string): Promise<{
        tenantId: string;
        projectId: string;
        links: {
            id: string;
            label: string;
            href: string;
            mode: "MANUAL" | "API" | "DEEPLINK" | "SSO";
        }[];
        exchangeTemplate: string;
    }>;
    createPortalLink(input: {
        email: string;
        tenantSlug: string;
        roleHint?: string;
        target?: string;
        context?: Record<string, unknown>;
    }): {
        signedToken: string;
        expiresInMinutes: number;
        href: string;
    };
    createOidcLink(input: OidcAuthorizeDto & {
        target?: string;
    }): {
        href: string;
        target: string;
        code: string;
        state: string;
        redirectUri: string;
        expiresInSeconds: number;
    };
}
