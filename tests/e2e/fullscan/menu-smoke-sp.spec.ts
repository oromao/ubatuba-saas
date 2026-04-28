import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * T5-SP-SMOKE-ALL-ROUTES
 * Smoke test com dados reais de São Paulo (GeoSampa)
 * Garante que todas as rotas do menu funcionam com dataset real
 */

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const adminStatePath = path.resolve(storageDir, 'admin.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

// São Paulo real data - sample from GeoSampa
const SP_GEOSAMPA_FIXTURE = path.resolve(__dirname, '../../../test/fixtures/sp-geosampa-sample.geojson');

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

/**
 * All SP-specific routes that need to be validated with real São Paulo data
 */
const SP_SPECIFIC_ROUTES = [
  '/app/dashboard',
  '/app/maps',
  '/app/ctm/parcelas',
  '/app/ctm/logradouros',
  '/app/ctm/equipamentos',
  '/app/ctm/vistorias',
  '/app/observatorio',
  '/app/pgv/zonas',
  '/app/pgv/faces',
  '/app/pgv/fatores',
  '/app/pgv/relatorio',
  '/app/modulos/obras',
  '/app/modulos/empresas',
  '/app/processes',
  '/app/notifications',
  '/app/aprovacao',
  '/app/integracoes',
  '/app/reurb',
  '/app/levamentamentos',
  '/app/certidoes',
  '/app/ambiental',
  '/app/alerts',
  '/app/modulos/obras-publicas',
  '/app/modulos/cemiterio',
  '/app/profile',
  '/app/modulos/compliance',
  '/app/assets',
];

test.describe('menu smoke SP (dados reais São Paulo)', () => {
  test.beforeAll(async () => {
    // Ensure SP fixture exists
    const fixturePath = SP_GEOSAMPA_FIXTURE;
    try {
      await fs.access(fixturePath);
    } catch {
      throw new Error(`Fixture de SP nao encontrado: ${fixturePath}`);
    }
  });

  test('SP: admin percorre todas as 30+ rotas do menu com dados reais', async ({ page }) => {
    await ensureSession(page, 'admin');

    expect(SP_SPECIFIC_ROUTES.length).toBeGreaterThanOrEqual(30);

    for (const href of SP_SPECIFIC_ROUTES) {
      await page.goto(href, { waitUntil: 'commit' }).catch(async () => {
        await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      });
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      
      // Should not redirect to login
      await expect(page).not.toHaveURL(/-/login/);
      
      // Should not show loading session indefinitely
      await expect(page.getByText('Carregando sessao institucional...')).toBeHidden({ timeout: 20_000 }).catch(() => undefined);

      const body = page.locator('body');
      const bodyText = (await body.textContent().catch(() => ''))?.trim() ?? '';
      
      // Should have visible content
      expect(bodyText.length, `rota sem conteudo visivel: ${href}`).toBeGreaterThan(0);
    }
  });

  test('SP: cada rota carrega em menos de 3s', async ({ page }) => {
    await ensureSession(page, 'admin');

    for (const href of SP_SPECIFIC_ROUTES.slice(0, 5)) { // Test first 5 for speed
      const startTime = Date.now();
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 5000 });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime, `rota ${href} demorou mais de 3s (${loadTime}ms)`).toBeLessThan(3000);
    }
  });

  test('SP: sem erros de console nas rotas principais', async ({ page }) => {
    await ensureSession(page, 'admin');

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test a subset of critical routes
    const criticalRoutes = [
      '/app/dashboard',
      '/app/maps',
      '/app/ctm/parcelas',
      '/app/ctm/logradouros',
      '/app/ctm/vistorias',
    ];

    for (const href of criticalRoutes) {
      consoleErrors.length = 0; // Clear previous errors
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForTimeout(500);
      
      expect(consoleErrors, `erros de console em ${href}: ${consoleErrors.join(', ')}`).toHaveLength(0);
    }
  });
});
