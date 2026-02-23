import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { TenantsService } from '../src/modules/tenants/tenants.service';
import { MembershipsService } from '../src/modules/memberships/memberships.service';
import { AuthRepository } from '../src/modules/auth/auth.repository';
import { RateLimiterService } from '../src/modules/shared/rate-limiter.service';

const jwtService = new JwtService({});

describe('AuthService login', () => {
  it('returns tokens for valid credentials', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const userId = '66f1f77a67e30f9f62000001';
    const tenantId = '66f1f77a67e30f9f62000002';

    const authService = new AuthService(
      jwtService,
      {
        findByEmail: jest.fn().mockResolvedValue({
          id: userId,
          email: 'admin@demo.local',
          passwordHash,
          isActive: true,
        }),
      } as unknown as UsersService,
      {
        findBySlug: jest.fn().mockResolvedValue({ id: tenantId }),
      } as unknown as TenantsService,
      {
        findByUserAndTenant: jest.fn().mockResolvedValue({ role: 'ADMIN' }),
      } as unknown as MembershipsService,
      {
        createRefreshToken: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const result = await authService.login('admin@demo.local', 'Password@123', 'demo');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });
});
