import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.decorator';

// Action-based permissions (granular per operation)
export type Permission =
  // CTM
  | 'CTM:READ' | 'CTM:CREATE' | 'CTM:UPDATE' | 'CTM:DELETE'
  | 'CTM:IMPORT' | 'CTM:EXPORT'
  // GIS
  | 'GIS:READ' | 'GIS:MANAGE_LAYERS'
  // PGV / Tax
  | 'PGV:READ' | 'PGV:CALCULATE' | 'PGV:MANAGE'
  | 'IPTU:CALCULATE' | 'IPTU:MANAGE'
  // Fiscalization
  | 'VISTORIAS:READ' | 'VISTORIAS:CREATE' | 'VISTORIAS:UPDATE'
  | 'ALVARAS:READ' | 'ALVARAS:CREATE' | 'ALVARAS:APPROVE'
  // Admin
  | 'TENANTS:MANAGE' | 'USERS:MANAGE' | 'AUDIT:READ'
  | 'SYSTEM:CONFIG';

// Role → Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'CTM:READ', 'CTM:CREATE', 'CTM:UPDATE', 'CTM:DELETE', 'CTM:IMPORT', 'CTM:EXPORT',
    'GIS:READ', 'GIS:MANAGE_LAYERS',
    'PGV:READ', 'PGV:CALCULATE', 'PGV:MANAGE',
    'IPTU:CALCULATE', 'IPTU:MANAGE',
    'VISTORIAS:READ', 'VISTORIAS:CREATE', 'VISTORIAS:UPDATE',
    'ALVARAS:READ', 'ALVARAS:CREATE', 'ALVARAS:APPROVE',
    'TENANTS:MANAGE', 'USERS:MANAGE', 'AUDIT:READ', 'SYSTEM:CONFIG',
  ],
  GESTOR: [
    'CTM:READ', 'CTM:CREATE', 'CTM:UPDATE', 'CTM:IMPORT', 'CTM:EXPORT',
    'GIS:READ', 'GIS:MANAGE_LAYERS',
    'PGV:READ', 'PGV:CALCULATE', 'PGV:MANAGE',
    'IPTU:CALCULATE', 'IPTU:MANAGE',
    'VISTORIAS:READ', 'VISTORIAS:CREATE', 'VISTORIAS:UPDATE',
    'ALVARAS:READ', 'ALVARAS:CREATE', 'ALVARAS:APPROVE',
    'USERS:MANAGE', 'AUDIT:READ',
  ],
  OPERADOR: [
    'CTM:READ', 'CTM:CREATE', 'CTM:UPDATE',
    'GIS:READ',
    'PGV:READ', 'PGV:CALCULATE',
    'IPTU:CALCULATE',
    'VISTORIAS:READ', 'VISTORIAS:CREATE', 'VISTORIAS:UPDATE',
    'ALVARAS:READ', 'ALVARAS:CREATE',
  ],
  LEITOR: [
    'CTM:READ',
    'GIS:READ',
    'PGV:READ',
    'VISTORIAS:READ',
    'ALVARAS:READ',
  ],
};

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Check if a role has all required permissions.
 */
export function hasPermissions(role: Role, required: Permission[]): boolean {
  const userPerms = ROLE_PERMISSIONS[role] || [];
  return required.every((p) => userPerms.includes(p));
}
