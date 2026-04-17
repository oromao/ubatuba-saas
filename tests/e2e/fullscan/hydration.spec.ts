import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const adminStatePath = path.resolve(storageDir, 'admin.json');

async function seedSession(page: any, roleKey = 'admin') {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
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
  await page.evaluate(
    (tokens: any) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
  );
}

test.describe('hydration guard', () => {
  test('session hydrates without blank screen and redirects when session is missing', async ({ page }) => {
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Carregando sessao institucional...')).toBeVisible({ timeout: 5_000 });
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 }).toBe('/login');
    await expect(page.locator('body')).toContainText('Entrar no painel', { timeout: 10_000 });

    await seedSession(page);
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Carregando sessao institucional...')).toBeHidden({ timeout: 20_000 });
    await expect(page.getByText('Redirecionando para login...')).toBeHidden({ timeout: 20_000 });
    await expect(page.locator('body')).toContainText('Painel Executivo', { timeout: 20_000 });
  });
});
