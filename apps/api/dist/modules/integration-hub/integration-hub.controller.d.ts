import { IntegrationHubService } from './integration-hub.service';
import { OidcAuthorizeDto } from '../auth/dto/oidc-authorize.dto';
export declare class IntegrationHubController {
    private readonly service;
    constructor(service: IntegrationHubService);
    listAdapters(req: {
        tenantId: string;
    }, projectId?: string): Promise<{}>;
    portalLinks(req: {
        tenantId: string;
    }, projectId?: string): Promise<{
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
    createPortalLink(req: {
        tenantId: string;
    }, body: {
        email: string;
        tenantSlug?: string;
        roleHint?: string;
        target?: string;
        context?: Record<string, unknown>;
    }, projectId?: string): {
        signedToken: string;
        expiresInMinutes: number;
        href: string;
    };
    createOidcLink(req: {
        tenantId: string;
    }, body: OidcAuthorizeDto & {
        target?: string;
        context?: Record<string, unknown>;
    }, projectId?: string): {
        href: string;
        target: string;
        code: string;
        state: string;
        redirectUri: string;
        expiresInSeconds: number;
    };
}
