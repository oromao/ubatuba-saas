import { Role } from './roles.decorator';
export type Permission = 'CTM:READ' | 'CTM:CREATE' | 'CTM:UPDATE' | 'CTM:DELETE' | 'CTM:IMPORT' | 'CTM:EXPORT' | 'GIS:READ' | 'GIS:MANAGE_LAYERS' | 'PGV:READ' | 'PGV:CALCULATE' | 'PGV:MANAGE' | 'IPTU:CALCULATE' | 'IPTU:MANAGE' | 'VISTORIAS:READ' | 'VISTORIAS:CREATE' | 'VISTORIAS:UPDATE' | 'ALVARAS:READ' | 'ALVARAS:CREATE' | 'ALVARAS:APPROVE' | 'TENANTS:MANAGE' | 'USERS:MANAGE' | 'AUDIT:READ' | 'SYSTEM:CONFIG';
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
export declare function hasPermissions(role: Role, required: Permission[]): boolean;
