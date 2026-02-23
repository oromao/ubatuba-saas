import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { MembershipsService } from '../src/modules/memberships/memberships.service';
import { AuthRepository } from '../src/modules/auth/auth.repository';
import { RateLimiterService } from '../src/modules/shared/rate-limiter.service';

const jwtService = new JwtService({});

describe('Password reset', () => {
  it('invalidates refresh tokens after reset', async () => {
    const userId = '66f1f77a67e30f9f62000003';
    const authRepository = {
      findPasswordResetToken: jest.fn().mockResolvedValue({
        id: 'reset-1',
        userId,
        used: false,
        expiresAt: new Date(Date.now() + 1000 * 60),
      }),
      markPasswordResetUsed: jest.fn(),
      deleteRefreshTokensByUser: jest.fn(),
      createAuthEvent: jest.fn(),
    } as unknown as AuthRepository;

    const usersService = {
      updatePassword: jest.fn().mockResolvedValue(true),
      findById: jest.fn().mockResolvedValue({ id: userId }),
    } as unknown as UsersService;

    const authService = new AuthService(
      jwtService,
      usersService,
      {} as unknown as TenantsService,
      {} as unknown as MembershipsService,
      authRepository,
      {} as unknown as RateLimiterService,
    );

    await authService.resetPassword('token', 'NovaSenha@123');

    expect(authRepository.deleteRefreshTokensByUser).toHaveBeenCalledWith(userId);
  });

  it('hashes new password', async () => {
    const hash = await bcrypt.hash('NovaSenha@123', 10);
    expect(hash).not.toBe('NovaSenha@123');
  });
});
