import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Public } from '../../common/guards/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PortalExchangeDto } from './dto/portal-exchange.dto';
import { OidcAuthorizeDto } from './dto/oidc-authorize.dto';
import { OidcCallbackDto } from './dto/oidc-callback.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.tenantSlug);
  }

  @Post('refresh')
  @Public()
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @Public()
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('portal/exchange')
  @Public()
  portalExchange(@Body() dto: PortalExchangeDto) {
    return this.authService.exchangePortalToken(dto.signedToken);
  }

  @Post('portal/logout')
  @Public()
  portalLogout(@Body() dto: PortalExchangeDto) {
    return this.authService.logoutPortalToken(dto.signedToken);
  }

  @Post('oidc/authorize')
  @Public()
  oidcAuthorize(@Body() dto: OidcAuthorizeDto) {
    return this.authService.createOidcAuthorizeUrl(dto);
  }

  @Post('oidc/callback')
  @Public()
  oidcCallback(@Body() dto: OidcCallbackDto) {
    return this.authService.exchangeOidcCode(dto.code);
  }

  @Post('forgot-password')
  @Public()
  forgot(@Body() dto: ForgotPasswordDto, @Req() req: { ip: string }) {
    return this.authService.forgotPassword(dto.email, req.ip);
  }

  @Post('reset-password')
  @Public()
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  change(@Body() dto: ChangePasswordDto, @Req() req: { user?: { sub?: string } }) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }
    return this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  session(@Req() req: { user?: { sub?: string; tenantId?: string; role?: string; department?: string } }) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }
    return this.authService.sessionContext(req.user.sub, req.user.tenantId, req.user.role, req.user.department);
  }

  @Get('institutional-readiness')
  @Public()
  institutionalReadiness() {
    return this.authService.institutionalReadiness();
  }
}
