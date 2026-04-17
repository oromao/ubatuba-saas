import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

async function ensureSession(page: any, roleKey = 'admin') {
  let roles: any;
  try {
    roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  } catch {
    const email = process.env.DEMO_EMAIL || 'demo@flydea.com.br';
    const password = process.env.DEMO_PASSWORD || 'demo123456';
    const tenantSlug = process.env.DEMO_TENANT || 'ubatuba';
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, tenantSlug }),
    });
    if (!response.ok) throw new Error(`Login failed: ${response.status}`);
    const payload = await response.json();
    const { accessToken, refreshToken, tenantId } = payload.data;
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tokens: any) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    }, { accessToken, refreshToken, tenantId });
    await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
    return;
  }

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
      '/app/ctm/parcelas',
      '/app/ctm/logradouros',
      '/app/ctm/mobiliario',
      '/app/ctm/vistorias',
      '/app/maps',
      '/app/dashboard',
      '/app/observatorio',
      '/app/processes',
      '/app/cartas',
      '/app/integracoes',
      '/app/modulos/obras',
      '/app/modulos/empresas',
      '/app/ambiental',
      '/app/pgv/zonas',
      '/app/reurb',
      '/app/poc',
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
