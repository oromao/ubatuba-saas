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
        createPortalSession: jest.fn(),
        createAuthEvent: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const result = await authService.login('admin@demo.local', 'Password@123', 'demo');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('creates and exchanges portal links', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.PORTAL_LINK_SECRET = 'portal-secret';
    const authService = new AuthService(
      jwtService,
      {
        findByEmail: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000001', email: 'cidadao@demo.local', isActive: true }),
      } as unknown as UsersService,
      {
        findBySlug: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000002' }),
      } as unknown as TenantsService,
      {
        findByUserAndTenant: jest.fn().mockResolvedValue({ role: 'CIDADAO' }),
      } as unknown as MembershipsService,
      {
        createRefreshToken: jest.fn(),
        createPortalSession: jest.fn(),
        createAuthEvent: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const { signedToken } = authService.createPortalLinkPayload({
      email: 'cidadao@demo.local',
      tenantSlug: 'demo',
      roleHint: 'CIDADAO',
      context: { source: 'portal', department: 'Gabinete' },
    });

    const result = await authService.exchangePortalToken(signedToken);
    expect(result.accessToken).toBeDefined();
    expect(result.context).toEqual({ source: 'portal', department: 'Gabinete' });
    expect(result.department).toBe('Gabinete');
  });

  it('creates oidc authorize url and exchanges code', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.OIDC_SHARED_SECRET = 'oidc-secret';
    process.env.WEB_URL = 'http://localhost:3000';
    const authService = new AuthService(
      jwtService,
      {
        findByEmail: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000001', email: 'cidadao@demo.local', isActive: true }),
      } as unknown as UsersService,
      {
        findBySlug: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000002' }),
      } as unknown as TenantsService,
      {
        findByUserAndTenant: jest.fn().mockResolvedValue({ role: 'CIDADAO' }),
      } as unknown as MembershipsService,
      {
        createRefreshToken: jest.fn(),
        createPortalSession: jest.fn(),
        createAuthEvent: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const authorize = authService.createOidcAuthorizeUrl({
      tenantSlug: 'demo',
      email: 'cidadao@demo.local',
      next: '/app/dashboard',
      state: 'demo-state',
      department: 'Secretaria de Financas',
    });
    expect(authorize.href).toContain('/portal/oidc/callback');

    const exchanged = await authService.exchangeOidcCode(authorize.code);
    expect(exchanged.accessToken).toBeDefined();
    expect(exchanged.next).toBe('/app/dashboard');
    expect(exchanged.department).toBe('Secretaria de Financas');
  });

  it('returns institutional session context', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const authService = new AuthService(
      jwtService,
      {
        findByEmail: jest.fn(),
        findById: jest.fn().mockResolvedValue({ id: '66f1f77a67e30f9f62000001', email: 'admin@demo.local' }),
      } as unknown as UsersService,
      {
        findBySlug: jest.fn(),
      } as unknown as TenantsService,
      {
        findByUserAndTenant: jest.fn(),
      } as unknown as MembershipsService,
      {
        createRefreshToken: jest.fn(),
        createPortalSession: jest.fn(),
        createAuthEvent: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const session = await authService.sessionContext('66f1f77a67e30f9f62000001', 'tenant-1', 'GESTOR', 'Secretaria de Obras');
    expect(session.department).toBe('Secretaria de Obras');
    expect(session.institutionalContext.oidcReady).toBe(true);
  });

  it('returns institutional readiness summary', () => {
    process.env.JWT_SECRET = 'test-secret';
    const authService = new AuthService(
      jwtService,
      {
        findByEmail: jest.fn(),
        findById: jest.fn(),
      } as unknown as UsersService,
      {
        findBySlug: jest.fn(),
      } as unknown as TenantsService,
      {
        findByUserAndTenant: jest.fn(),
      } as unknown as MembershipsService,
      {
        createRefreshToken: jest.fn(),
        createPortalSession: jest.fn(),
        createAuthEvent: jest.fn(),
      } as unknown as AuthRepository,
      {
        consume: jest.fn(),
      } as unknown as RateLimiterService,
    );

    const readiness = authService.institutionalReadiness();
    expect(readiness.oidcReady).toBe(true);
    expect(readiness.samlReady).toBe(true);
    expect(readiness.remainingExternalDependency).toContain('Identity provider');
  });
});
