import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
export type TenantRequest = Request & {
    tenantId?: string;
    user?: {
        sub?: string;
        tenantId?: string;
        role?: string;
    };
};
export declare class TenantGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
