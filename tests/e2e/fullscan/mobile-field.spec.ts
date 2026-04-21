import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

const ensureSession = async (page: any, roleKey = 'admin') => {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === roleKey);
  if (!profile) throw new Error(`Perfil ${roleKey} nao encontrado`);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: profile.email,
      password: profile.password,
      tenantSlug: roles.tenant,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(`Falha login ${roleKey}: ${response.status}`);
  const { accessToken, refreshToken, tenantId } = payload.data;
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (tokens: any) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
  );
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
};

test.describe('T4-MOBILE: Mobile field offline-first flow', () => {
  test('01 - Mobile page loads with offline-first controls', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/mobile', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'FlyDea Mobile Campo' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Coleta CTM offline-first com fila local (IndexedDB) e sincronização automática.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-search-input')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-search-button')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-save-offline')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-sync-now')).toBeVisible({ timeout: 10_000 });
  });
});
