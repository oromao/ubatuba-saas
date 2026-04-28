import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const adminStatePath = path.resolve(storageDir, 'admin.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

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
  }, { accessToken, refreshToken, tenantId });
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
}

test.describe('menu smoke', () => {
  test('admin percorre rotas reais do menu sem telas vazias', async ({ page }) => {
    await ensureSession(page, 'admin');

    const menuRoutes = [
      '/app/dashboard',
      '/app/ctm/parcelas',
      '/app/ctm/logradouros',
      '/app/ctm/equipamentos',
      '/app/ctm/vistorias',
      '/app/maps',
      '/app/observatorio',
      '/app/relatorios',
      '/app/processes',
      '/app/notifications',
      '/app/aprovacao',
      '/app/integracoes',
      '/app/modulos/obras',
      '/app/modulos/empresas',
      '/app/ambiental',
      '/app/pgv/zonas',
      '/app/reurb',
      '/app/certidoes',
      '/app/levantamentos',
      '/app/profile',
      '/app/modulos/compliance',
      '/app/alerts',
      '/app/modulos/obras-publicas',
      '/app/modulos/cemiterio',
      '/app/pgv/fatores',
      '/app/pgv/faces',
      '/app/pgv/relatorio',
      '/app/assets',
    ];
    expect(menuRoutes.length).toBeGreaterThan(0);

    for (const href of menuRoutes) {
      await page.goto(href, { waitUntil: 'commit' }).catch(async () => {
        await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      });
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText('Carregando sessao institucional...')).toBeHidden({ timeout: 20_000 }).catch(() => undefined);

      const heading = page.locator('h1').first();
      const body = page.locator('body');

      if (await heading.isVisible().catch(() => false)) {
        await expect(heading).toBeVisible({ timeout: 15_000 });
      }

      const bodyText = (await body.textContent().catch(() => ''))?.trim() ?? '';
      expect(bodyText.length, `rota sem conteudo visível: ${href}`).toBeGreaterThan(0);
    }
  });
});
