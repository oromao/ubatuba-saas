"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAccessDeniedException = exports.TenantNotFoundException = exports.InternalServerErrorException = exports.BusinessRuleException = exports.ConflictStateException = exports.DuplicateResourceException = exports.ResourceNotFoundException = exports.AccessDeniedException = exports.AuthenticationException = exports.ValidationException = void 0;
exports.formatValidationErrors = formatValidationErrors;
const common_1 = require("@nestjs/common");
class ValidationException extends common_1.BadRequestException {
    constructor(message, errors) {
        super({
            message,
            errors,
        });
    }
}
exports.ValidationException = ValidationException;
class AuthenticationException extends common_1.UnauthorizedException {
    constructor(message = 'Invalid or expired token') {
        super({ message });
    }
}
exports.AuthenticationException = AuthenticationException;
class AccessDeniedException extends common_1.ForbiddenException {
    constructor(message = 'Insufficient permissions', requiredRole) {
        super({
            message,
            requiredRole,
        });
    }
}
exports.AccessDeniedException = AccessDeniedException;
class ResourceNotFoundException extends common_1.NotFoundException {
    constructor(resourceType, identifier) {
        super(`${resourceType} with id "${identifier}" not found`);
    }
}
exports.ResourceNotFoundException = ResourceNotFoundException;
class DuplicateResourceException extends common_1.ConflictException {
    constructor(message, field) {
        super({
            message,
            field,
        });
    }
}
exports.DuplicateResourceException = DuplicateResourceException;
class ConflictStateException extends common_1.ConflictException {
    constructor(currentState, attemptedAction) {
        super(`Cannot ${attemptedAction} while in "${currentState}" state`);
    }
}
exports.ConflictStateException = ConflictStateException;
class BusinessRuleException extends common_1.HttpException {
    constructor(message, details) {
        super({
            message,
            details,
        }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.BusinessRuleException = BusinessRuleException;
class InternalServerErrorException extends common_1.HttpException {
    constructor(message = 'An unexpected error occurred', context) {
        super({
            message,
            context,
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class TenantNotFoundException extends common_1.NotFoundException {
    constructor(tenantId) {
        super(`Tenant "${tenantId}" not found or not accessible`);
    }
}
exports.TenantNotFoundException = TenantNotFoundException;
class TenantAccessDeniedException extends common_1.ForbiddenException {
    constructor(tenantId) {
        super(`Access denied to tenant "${tenantId}"`);
    }
}
exports.TenantAccessDeniedException = TenantAccessDeniedException;
function formatValidationErrors(errors) {
    const formatted = {};
    for (const [field, messages] of Object.entries(errors)) {
        formatted[field] = messages.join('; ');
    }
    return formatted;
}
//# sourceMappingURL=index.js.map