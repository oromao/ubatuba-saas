import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Request } from 'express';

export type TenantRequest = Request & {
  tenantId?: string;
  user?: { sub?: string; tenantId?: string; role?: string };
};

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<TenantRequest>();
    const headerTenant = request.header('x-tenant-id');
    const tokenTenant = request.user?.tenantId;
    const tenantId = headerTenant ?? tokenTenant;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant nao identificado');
    }

    request.tenantId = tenantId;
    return true;
  }
}
