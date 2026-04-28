"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const tenant_guard_1 = require("../src/common/guards/tenant.guard");
function createContext(headers) {
    const handler = () => undefined;
    class TestController {
    }
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers, header: (key) => headers[key] }),
        }),
        getHandler: () => handler,
        getClass: () => TestController,
    };
}
describe('TenantGuard', () => {
    it('reads tenant id from header', () => {
        const reflector = new core_1.Reflector();
        const guard = new tenant_guard_1.TenantGuard(reflector);
        const context = createContext({ 'x-tenant-id': 'tenant-1' });
        const result = guard.canActivate(context);
        expect(result).toBe(true);
    });
});
//# sourceMappingURL=tenant.guard.spec.js.map