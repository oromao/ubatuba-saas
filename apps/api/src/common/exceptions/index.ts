import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';

/**
 * Standard HTTP Exception Types for consistent API responses
 *
 * Usage:
 * - throw new ValidationException('Email already exists')
 * - throw new ResourceNotFoundException('Parcel not found')
 * - throw new DuplicateResourceException('Project slug already in use')
 * - throw new UnauthorizedException('Invalid token')
 * - throw new AccessDeniedException('Admin role required')
 * - throw new ConflictStateException('Cannot delete in draft status')
 */

/**
 * 400 Bad Request — Validation or malformed input
 */
export class ValidationException extends BadRequestException {
  constructor(message: string, errors?: Record<string, unknown>) {
    super({
      message,
      errors,
    });
  }
}

/**
 * 401 Unauthorized — Missing or invalid authentication
 */
export class AuthenticationException extends UnauthorizedException {
  constructor(message: string = 'Invalid or expired token') {
    super({ message });
  }
}

/**
 * 403 Forbidden — Authenticated but insufficient permissions (RBAC)
 */
export class AccessDeniedException extends ForbiddenException {
  constructor(message: string = 'Insufficient permissions', requiredRole?: string) {
    super({
      message,
      requiredRole,
    });
  }
}

/**
 * 404 Not Found — Resource doesn't exist
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceType: string, identifier: string | number) {
    super(`${resourceType} with id "${identifier}" not found`);
  }
}

/**
 * 409 Conflict — State conflict or duplicate resource
 */
export class DuplicateResourceException extends ConflictException {
  constructor(message: string, field?: string) {
    super({
      message,
      field,
    });
  }
}

/**
 * 409 Conflict — Invalid state transition
 */
export class ConflictStateException extends ConflictException {
  constructor(currentState: string, attemptedAction: string) {
    super(`Cannot ${attemptedAction} while in "${currentState}" state`);
  }
}

/**
 * 422 Unprocessable Entity — Business rule violation
 */
export class BusinessRuleException extends HttpException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      {
        message,
        details,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * 500 Internal Server Error — Only for genuinely unexpected errors
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'An unexpected error occurred', context?: Record<string, unknown>) {
    super(
      {
        message,
        context,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Multi-tenant specific exceptions
 */

export class TenantNotFoundException extends NotFoundException {
  constructor(tenantId: string | number) {
    super(`Tenant "${tenantId}" not found or not accessible`);
  }
}

export class TenantAccessDeniedException extends ForbiddenException {
  constructor(tenantId: string | number) {
    super(`Access denied to tenant "${tenantId}"`);
  }
}

/**
 * Helper to format validation errors from class-validator
 */
export function formatValidationErrors(errors: Record<string, string[]>): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    formatted[field] = messages.join('; ');
  }
  return formatted;
}
