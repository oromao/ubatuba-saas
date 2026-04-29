import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { MembershipsService } from '../memberships/memberships.service';
import { AuthRepository } from './auth.repository';
import { RateLimiterService } from '../shared/rate-limiter.service';
import { OidcAuthorizeDto } from './dto/oidc-authorize.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly usersService;
    private readonly tenantsService;
    private readonly membershipsService;
    private readonly authRepository;
    private readonly rateLimiter;
    constructor(jwtService: JwtService, usersService: UsersService, tenantsService: TenantsService, membershipsService: MembershipsService, authRepository: AuthRepository, rateLimiter: RateLimiterService);
    private hashToken;
    private hashPortalLink;
    private hashOidcCode;
    private createAccessToken;
    login(email: string, password: string, tenantSlug: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
    }>;
    exchangePortalToken(signedToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
        context: Record<string, unknown>;
        department: string | null;
    }>;
    createOidcAuthorizeUrl(input: OidcAuthorizeDto): {
        code: string;
        state: string;
        redirectUri: string;
        href: string;
        expiresInSeconds: number;
    };
    exchangeOidcCode(code: string): Promise<{
        state: string;
        next: string;
        redirectUri: string;
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
        context: Record<string, unknown>;
        department: string | null;
    }>;
    logoutPortalToken(signedToken: string): Promise<{
        success: boolean;
    }>;
    createPortalLinkPayload(input: {
        email: string;
        tenantSlug: string;
        roleHint?: string;
        context?: Record<string, unknown>;
    }): {
        signedToken: string;
        expiresInMinutes: number;
    };
    sessionContext(userId: string, tenantId?: string, role?: string, department?: string | null): Promise<{
        userId: any;
        email: string;
        tenantId: string | null;
        role: string | null;
        department: string | null;
        institutionalContext: {
            handoffReady: boolean;
            portalCoexistence: boolean;
            oidcReady: boolean;
        };
    }>;
    institutionalReadiness(): {
        handoffReady: boolean;
        portalCoexistence: boolean;
        oidcReady: boolean;
        samlReady: boolean;
        fallbackLocalLogin: boolean;
        logoutCoherent: boolean;
        claimMapping: string[];
        currentFlow: string[];
        remainingExternalDependency: string;
    };
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(email: string, ip: string): Promise<{
        success: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    changePassword(userId: string, current: string, next: string): Promise<{
        success: boolean;
    }>;
}
