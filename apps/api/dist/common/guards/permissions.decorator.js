"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermissions = exports.PERMISSIONS_KEY = exports.ROLE_PERMISSIONS = void 0;
exports.hasPermissions = hasPermissions;
const common_1 = require("@nestjs/common");
exports.ROLE_PERMISSIONS = {
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
exports.PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
function hasPermissions(role, required) {
    const userPerms = exports.ROLE_PERMISSIONS[role] || [];
    return required.every((p) => userPerms.includes(p));
}
//# sourceMappingURL=permissions.decorator.js.map