import { BadRequestException, ConflictException, ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
export declare class ValidationException extends BadRequestException {
    constructor(message: string, errors?: Record<string, unknown>);
}
export declare class AuthenticationException extends UnauthorizedException {
    constructor(message?: string);
}
export declare class AccessDeniedException extends ForbiddenException {
    constructor(message?: string, requiredRole?: string);
}
export declare class ResourceNotFoundException extends NotFoundException {
    constructor(resourceType: string, identifier: string | number);
}
export declare class DuplicateResourceException extends ConflictException {
    constructor(message: string, field?: string);
}
export declare class ConflictStateException extends ConflictException {
    constructor(currentState: string, attemptedAction: string);
}
export declare class BusinessRuleException extends HttpException {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class InternalServerErrorException extends HttpException {
    constructor(message?: string, context?: Record<string, unknown>);
}
export declare class TenantNotFoundException extends NotFoundException {
    constructor(tenantId: string | number);
}
export declare class TenantAccessDeniedException extends ForbiddenException {
    constructor(tenantId: string | number);
}
export declare function formatValidationErrors(errors: Record<string, string[]>): Record<string, string>;
