import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const adminStatePath = path.resolve(storageDir, 'admin.json');

async function ensureSession(page: any, roleKey = 'admin') {
  let roles: any;
  try {
    roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  } catch {
    roles = { profiles: [{ key: 'admin' }], tenant: 'demo' };
  }

  const profile = roles.profiles.find((item: any) => item.key === roleKey);
  if (!profile) throw new Error(`Perfil ${roleKey} nao encontrado`);
  const adminState = JSON.parse(await fs.readFile(adminStatePath, 'utf8'));
  const origin = adminState.origins?.find((item: any) => item.origin === 'http://localhost:3000');
  const accessToken = origin?.localStorage?.find((item: any) => item.name === 'accessToken')?.value;
  const refreshToken = origin?.localStorage?.find((item: any) => item.name === 'refreshToken')?.value;
  const tenantId = origin?.localStorage?.find((item: any) => item.name === 'tenantId')?.value;
  if (!accessToken || !refreshToken || !tenantId) {
    throw new Error(`Seed localStorage ausente para ${roleKey}`);
  }
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tokens: any) => {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    sessionStorage.setItem('tenantId', tokens.tenantId);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tenantId', tokens.tenantId);
  }, { accessToken, refreshToken, tenantId });
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
}

test.describe('admin routing audit', () => {
  test('admin routes load without redirect', async ({ page }) => {
    await ensureSession(page, 'admin');

    const routesToTest = [
      '/app/relatorios',
      '/app/aprovacao',
      '/app/certidoes',
      '/app/notifications'
    ];

    for (const href of routesToTest) {
      console.log(`Testing route: ${href}`);
      await page.goto(href, { waitUntil: 'domcontentloaded' });
      
      // Wait a bit for any client-side redirects
      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url, `Route ${href} redirected to ${url}`).toContain(href);
      
      // Ensure we are not on dashboard (unless we explicitly tested dashboard)
      if (href !== '/app/dashboard') {
        expect(url).not.toContain('/app/dashboard');
      }

      // Check for "Acesso nao autorizado" message which appears if RBAC fails but redirect doesn't happen
      const unauthorized = await page.getByText('Acesso nao autorizado').isVisible();
      expect(unauthorized, `Route ${href} showed "Acesso nao autorizado"`).toBe(false);
    }
  });
});
