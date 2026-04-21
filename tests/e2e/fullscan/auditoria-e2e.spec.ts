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
  return { accessToken, tenantId };
};

test.describe('T4-AUDIT: Audit page and tenant-safe parcel log', () => {
  test('01 - Sidebar exposes audit navigation and page loads', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });

    const auditLink = page.getByRole('link', { name: 'Auditoria' });
    await expect(auditLink).toBeVisible({ timeout: 10_000 });
    await auditLink.click();

    await expect(page).toHaveURL(/\/app\/auditoria/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Auditoria de Dados' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible({ timeout: 10_000 });
  });

  test('02 - Audit page filters parcel actions', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/auditoria', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Auditoria de Dados' })).toBeVisible({ timeout: 10_000 });
    await page.locator('select').first().selectOption('UPDATE');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText(/Nenhum registro encontrado|registro(s)? encontrado(s)?/i)).toBeVisible({ timeout: 15_000 });
  });
});
