import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.decorator';
import { PERMISSIONS_KEY, Permission, hasPermissions } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permissions required → allow
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: { role?: Role } }>();
    if (!user?.role) {
      throw new ForbiddenException('Perfil nao autorizado');
    }

    if (!hasPermissions(user.role, requiredPermissions)) {
      throw new ForbiddenException(
        `Permissao insuficiente. Requer: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
