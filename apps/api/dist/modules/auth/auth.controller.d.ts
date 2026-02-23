import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
}
