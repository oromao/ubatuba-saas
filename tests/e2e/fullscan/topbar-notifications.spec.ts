import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

async function ensureSession(page: any) {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'admin') ?? roles.profiles[0];
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
  if (!response.ok) throw new Error(`Falha login admin: ${response.status}`);
  const { accessToken, refreshToken, tenantId } = payload.data;

  await page.context().addInitScript(
    (tokens: { accessToken: string; refreshToken: string; tenantId: string }) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
    { accessToken, refreshToken, tenantId },
  );
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
}

test.describe('topbar notifications badge', () => {
  test('shows a real pending-count badge and opens cartas', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/notifications-letters/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { count: 3 } }),
      });
    });

    const button = page.getByRole('button', { name: /3 notificacoes oficiais pendentes/i });
    await expect(button).toBeVisible({ timeout: 10_000 });
    await expect(button.locator('span.absolute')).toHaveText('3');

    await button.click();
    await expect(page).toHaveURL(/\/app\/cartas/);
  });
});
