import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { MembershipsService } from '../memberships/memberships.service';
import { AuthRepository } from './auth.repository';
import { RateLimiterService } from '../shared/rate-limiter.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly usersService;
    private readonly tenantsService;
    private readonly membershipsService;
    private readonly authRepository;
    private readonly rateLimiter;
    constructor(jwtService: JwtService, usersService: UsersService, tenantsService: TenantsService, membershipsService: MembershipsService, authRepository: AuthRepository, rateLimiter: RateLimiterService);
    private hashToken;
    private createAccessToken;
    login(email: string, password: string, tenantSlug: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tenantId: any;
        role: import("../../common/guards/roles.decorator").Role;
    }>;
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
