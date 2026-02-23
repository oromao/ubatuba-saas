import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantGuard } from '../src/common/guards/tenant.guard';

function createContext(headers: Record<string, string>) {
  const handler = () => undefined;
  class TestController {}
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, header: (key: string) => headers[key] }),
    }),
    getHandler: () => handler,
    getClass: () => TestController,
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  it('reads tenant id from header', () => {
    const reflector = new Reflector();
    const guard = new TenantGuard(reflector);
    const context = createContext({ 'x-tenant-id': 'tenant-1' });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
