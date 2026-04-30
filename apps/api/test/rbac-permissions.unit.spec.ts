import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { hasPermissions, ROLE_PERMISSIONS, Permission } from '../src/common/guards/permissions.decorator';
import { Role } from '../src/common/guards/roles.decorator';

describe('RBAC - Permissions System (T9-RBAC-ACTIONS)', () => {
  describe('role-permission mapping', () => {
    it('ADMIN should have all permissions', () => {
      const perms = ROLE_PERMISSIONS.ADMIN;
      expect(perms).toContain('CTM:DELETE');
      expect(perms).toContain('SYSTEM:CONFIG');
      expect(perms).toContain('TENANTS:MANAGE');
    });

    it('GESTOR should have management permissions but not tenant management', () => {
      const perms = ROLE_PERMISSIONS.GESTOR;
      expect(perms).toContain('ALVARAS:APPROVE');
      expect(perms).toContain('PGV:MANAGE');
      expect(perms).not.toContain('TENANTS:MANAGE');
      expect(perms).not.toContain('SYSTEM:CONFIG');
    });

    it('OPERADOR should have operational permissions only', () => {
      const perms = ROLE_PERMISSIONS.OPERADOR;
      expect(perms).toContain('CTM:CREATE');
      expect(perms).toContain('VISTORIAS:CREATE');
      expect(perms).not.toContain('CTM:DELETE');
      expect(perms).not.toContain('ALVARAS:APPROVE');
    });

    it('LEITOR should have read-only permissions', () => {
      const perms = ROLE_PERMISSIONS.LEITOR;
      expect(perms).toContain('CTM:READ');
      expect(perms).toContain('GIS:READ');
      expect(perms).not.toContain('CTM:CREATE');
      expect(perms).not.toContain('CTM:UPDATE');
    });
  });

  describe('hasPermissions', () => {
    it('should return true when role has all required permissions', () => {
      expect(hasPermissions('ADMIN', ['CTM:DELETE', 'SYSTEM:CONFIG'])).toBe(true);
      expect(hasPermissions('GESTOR', ['ALVARAS:APPROVE', 'PGV:MANAGE'])).toBe(true);
      expect(hasPermissions('OPERADOR', ['CTM:READ', 'VISTORIAS:CREATE'])).toBe(true);
      expect(hasPermissions('LEITOR', ['CTM:READ'])).toBe(true);
    });

    it('should return false when role is missing any permission', () => {
      expect(hasPermissions('OPERADOR', ['CTM:DELETE'])).toBe(false);
      expect(hasPermissions('LEITOR', ['CTM:CREATE'])).toBe(false);
      expect(hasPermissions('GESTOR', ['SYSTEM:CONFIG'])).toBe(false);
    });

    it('should handle empty required permissions', () => {
      expect(hasPermissions('LEITOR', [])).toBe(true);
      expect(hasPermissions('ADMIN', [])).toBe(true);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    const createContext = (role?: Role) => {
      const request = { user: role ? { role } : undefined };
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext;
    };

    it('should allow when no roles required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      expect(guard.canActivate(createContext())).toBe(true);
    });

    it('should allow when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
    });

    it('should deny when user has wrong role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      expect(() => guard.canActivate(createContext('OPERADOR'))).toThrow(ForbiddenException);
    });

    it('should deny when user has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
    });
  });

  describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new PermissionsGuard(reflector);
    });

    const createContext = (role?: Role) => {
      const request = { user: role ? { role } : undefined };
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext;
    };

    it('should allow when no permissions required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      expect(guard.canActivate(createContext())).toBe(true);
    });

    it('should allow ADMIN to delete parcels', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CTM:DELETE']);
      expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
    });

    it('should deny OPERADOR from deleting parcels', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CTM:DELETE']);
      expect(() => guard.canActivate(createContext('OPERADOR'))).toThrow(ForbiddenException);
    });

    it('should allow GESTOR to approve alvaras', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ALVARAS:APPROVE']);
      expect(guard.canActivate(createContext('GESTOR'))).toBe(true);
    });

    it('should deny LEITOR from any write action', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CTM:CREATE']);
      expect(() => guard.canActivate(createContext('LEITOR'))).toThrow(ForbiddenException);
    });

    it('should check multiple required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CTM:CREATE', 'PGV:CALCULATE']);
      expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
      expect(guard.canActivate(createContext('GESTOR'))).toBe(true);
      // OPERADOR has both CTM:CREATE and PGV:CALCULATE
      expect(guard.canActivate(createContext('OPERADOR'))).toBe(true);
    });
  });
});
