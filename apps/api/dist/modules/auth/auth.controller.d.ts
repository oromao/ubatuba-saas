import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PortalExchangeDto } from './dto/portal-exchange.dto';
import { OidcAuthorizeDto } from './dto/oidc-authorize.dto';
import { OidcCallbackDto } from './dto/oidc-callback.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshDto): Promise<{
        success: boolean;
    }>;
    portalExchange(dto: PortalExchangeDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
        context: Record<string, unknown>;
        department: string | null;
    }>;
    portalLogout(dto: PortalExchangeDto): Promise<{
        success: boolean;
    }>;
    oidcAuthorize(dto: OidcAuthorizeDto): {
        code: string;
        state: string;
        redirectUri: string;
        href: string;
        expiresInSeconds: number;
    };
    oidcCallback(dto: OidcCallbackDto): Promise<{
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
    forgot(dto: ForgotPasswordDto, req: {
        ip: string;
    }): Promise<{
        success: boolean;
    }>;
    reset(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    change(dto: ChangePasswordDto, req: {
        user?: {
            sub?: string;
        };
    }): Promise<{
        success: boolean;
    }>;
    session(req: {
        user?: {
            sub?: string;
            tenantId?: string;
            role?: string;
            department?: string;
        };
    }): Promise<{
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
}
