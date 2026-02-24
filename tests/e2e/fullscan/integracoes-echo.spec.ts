import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

const ensureSession = async (page: any) => {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'admin');
  if (!profile) throw new Error('Perfil admin nao encontrado');
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
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (tokens) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken: payload.data.accessToken, refreshToken: payload.data.refreshToken, tenantId: payload.data.tenantId },
  );
  return { accessToken: payload.data.accessToken as string, tenantId: payload.data.tenantId as string };
};

test.describe('integracoes echo', () => {
  test.use({ storageState: path.resolve(storageDir, 'admin.json') });

  test('@integracoes cria conector echo e executa sync', async ({ page }) => {
    const session = await ensureSession(page);
    await page.goto('/app/integracoes', { waitUntil: 'domcontentloaded' });

    const connectorName = `Echo-${Date.now()}`;
    await fetch(`${API_URL}/tax-integration/connectors`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
        'X-Tenant-Id': session.tenantId,
      },
      body: JSON.stringify({
        name: connectorName,
        mode: 'REST_JSON',
        config: { endpoint: 'http://localhost:4000/tax-integration/echo' },
        fieldMapping: {
          inscricao: 'inscricao',
          contribuinte: 'contribuinte',
          endereco: 'endereco',
          valorVenal: 'valor_venal',
        },
      }),
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    const connectorRow = page
      .locator('div')
      .filter({ hasText: connectorName })
      .filter({ has: page.getByRole('button', { name: 'Testar' }) })
      .first();
    const [testRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/test-connection') && res.request().method() === 'POST'),
      connectorRow.getByRole('button', { name: 'Testar' }).first().click(),
    ]);
    if (!testRes.ok()) throw new Error(`Teste de conexao falhou: ${testRes.status()}`);

    const [syncRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/run-sync') && res.request().method() === 'POST'),
      connectorRow.getByRole('button', { name: 'Sync manual' }).first().click(),
    ]);
    if (!syncRes.ok()) throw new Error(`Sync manual falhou: ${syncRes.status()}`);
  });
});
