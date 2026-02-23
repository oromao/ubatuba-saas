import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { MembershipsService } from '../memberships/memberships.service';
import { AuthRepository } from './auth.repository';
import { RateLimiterService } from '../shared/rate-limiter.service';
import { asObjectId } from '../../common/utils/object-id';

const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;
const RESET_TTL_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly membershipsService: MembershipsService,
    private readonly authRepository: AuthRepository,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createAccessToken(payload: {
    sub: string;
    tenantId: string;
    role: string;
  }) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: ACCESS_TTL,
    });
  }

  async login(email: string, password: string, tenantSlug: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais invalidas');
    }
    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const tenant = await this.tenantsService.findBySlug(tenantSlug);
    if (!tenant) {
      throw new UnauthorizedException('Tenant invalido');
    }

    const membership = await this.membershipsService.findByUserAndTenant(
      user.id,
      tenant.id,
    );
    if (!membership) {
      throw new UnauthorizedException('Sem permissao para este tenant');
    }

    const accessToken = await this.createAccessToken({
      sub: user.id,
      tenantId: tenant.id,
      role: membership.role,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

    await this.authRepository.createRefreshToken({
      userId: asObjectId(user.id),
      tenantId: asObjectId(tenant.id),
      role: membership.role,
      tokenHash: refreshHash,
      expiresAt,
    });

    return { accessToken, refreshToken, tenantId: tenant.id, role: membership.role };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.authRepository.findRefreshToken(tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh invalido');
    }

    await this.authRepository.deleteRefreshToken(tokenHash);

    const user = await this.usersService.findById(String(stored.userId));
    if (!user) {
      throw new UnauthorizedException('Usuario invalido');
    }

    const accessToken = await this.createAccessToken({
      sub: user.id,
      tenantId: String(stored.tenantId),
      role: stored.role,
    });

    const newRefresh = randomBytes(48).toString('hex');
    const newHash = this.hashToken(newRefresh);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

    await this.authRepository.createRefreshToken({
      userId: asObjectId(user.id),
      tenantId: asObjectId(stored.tenantId),
      role: stored.role,
      tokenHash: newHash,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefresh };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.authRepository.deleteRefreshToken(tokenHash);
    return { success: true };
  }

  async forgotPassword(email: string, ip: string) {
    try {
      await this.rateLimiter.consume(`forgot:${ip}`, 1);
      await this.rateLimiter.consume(`forgot:${email.toLowerCase()}`, 1);
    } catch {
      throw new HttpException('Muitas solicitacoes', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user) {
      return { success: true };
    }

    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

    await this.authRepository.createPasswordResetToken({
      userId: asObjectId(user.id),
      tokenHash,
      expiresAt,
      used: false,
    });

    const resetLink = `${process.env.WEB_URL}/reset-password?token=${token}`;
    await this.authRepository.createEmailOutbox({
      to: user.email,
      subject: 'Recuperacao de senha FlyDea',
      body: `Use o link: ${resetLink}`,
    });
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[flydea] reset password link: ${resetLink}`);
    }

    await this.authRepository.createAuthEvent({
      userId: asObjectId(user.id),
      type: 'PASSWORD_RESET_REQUESTED',
    });

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const record = await this.authRepository.findPasswordResetToken(tokenHash);
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Token invalido');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(String(record.userId), passwordHash);
    await this.authRepository.markPasswordResetUsed(record.id);
    await this.authRepository.deleteRefreshTokensByUser(String(record.userId));

    await this.authRepository.createAuthEvent({
      userId: asObjectId(record.userId),
      type: 'PASSWORD_RESET_COMPLETED',
    });

    return { success: true };
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario invalido');
    }
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Senha atual invalida');
    }
    const passwordHash = await bcrypt.hash(next, 10);
    await this.usersService.updatePassword(user.id, passwordHash);
    await this.authRepository.deleteRefreshTokensByUser(user.id);

    await this.authRepository.createAuthEvent({
      userId: asObjectId(user.id),
      type: 'PASSWORD_CHANGED',
    });

    return { success: true };
  }
}
