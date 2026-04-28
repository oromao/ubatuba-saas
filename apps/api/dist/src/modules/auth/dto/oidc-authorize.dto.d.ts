export declare class OidcAuthorizeDto {
    tenantSlug: string;
    email: string;
    roleHint?: string;
    department?: string;
    state?: string;
    redirectUri?: string;
    next?: string;
    context?: Record<string, unknown>;
}
