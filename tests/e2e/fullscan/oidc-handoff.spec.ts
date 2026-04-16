import fs from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('oidc handoff', () => {
  test.use({ storageState: path.resolve(storageDir, 'admin.json') });

  test('@critical portal oidc handoff -> session -> dashboard -> logout', async ({ page }) => {
    const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
    const profile = roles.profiles.find((item: any) => item.key === 'admin');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        password: profile.password,
        tenantSlug: roles.tenant,
      }),
    });
    const loginPayload = await loginRes.json();
    const token = loginPayload.data.accessToken as string;
    const tenantId = loginPayload.data.tenantId as string;

    const oidcRes = await fetch(`${API_URL}/auth/oidc/authorize`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
      body: JSON.stringify({
        tenantSlug: roles.tenant,
        email: profile.email,
        next: '/app/dashboard',
        state: 'demo-state',
      }),
    });
    const oidcPayload = await oidcRes.json();
    expect(oidcRes.ok).toBeTruthy();

    await page.goto(oidcPayload.data.href, { waitUntil: 'domcontentloaded' });
    const sessionRes = await fetch(`${API_URL}/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
    });
    const sessionPayload = await sessionRes.json();
    expect(sessionRes.ok).toBeTruthy();
    expect(sessionPayload.data.tenantId).toBe(tenantId);
    expect(sessionPayload.data.email).toBe(profile.email);
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 20000 }).toBe('/app/dashboard');
    await expect(page.getByText('Painel Executivo')).toBeVisible();

    await page.getByTestId('sidebar-logout').first().click();
    await page.waitForURL('**/login', { timeout: 20000 });
  });
});
