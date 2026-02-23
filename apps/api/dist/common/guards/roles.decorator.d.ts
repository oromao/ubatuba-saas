export type Role = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'LEITOR';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
