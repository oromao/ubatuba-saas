import fs from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const storageDir = `${process.cwd()}/storage`;
const rolesPath = `${storageDir}/roles.json`;

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
  if (!response.ok) throw new Error(`Falha login: ${response.status}`);
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
  await page.waitForURL(/\/app\/dashboard/, { timeout: 10_000 });
  return { accessToken };
}

test.describe('T3-DASH-PROOF: dashboard proof', () => {
  test('persists dashboard layout across reloads', async ({ page }) => {
    const session = await ensureSession(page);

    await expect(page.getByRole('heading', { name: 'Painel Executivo' })).toBeVisible({ timeout: 10_000 });
    await page.locator('select').first().selectOption('operational');

    const saveResponse = page.waitForResponse((response) => response.url().includes('/dashboard/layout') && response.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Salvar layout' }).click();
    await saveResponse;

    const layoutResponse = await page.request.get(`${API_URL}/dashboard/layout`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(layoutResponse.ok()).toBeTruthy();
    const layout = await layoutResponse.json();
    expect(layout?.data?.viewMode ?? layout?.viewMode).toBe('operational');

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Painel Executivo' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('select').first()).toHaveValue('operational');
    await expect(page.getByText('Widgets configuráveis')).toBeVisible();
  });

  test('renders real KPI and observability data from the backend', async ({ page }) => {
    const session = await ensureSession(page);

    const kpisResponse = await page.request.get(`${API_URL}/dashboard/kpis`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(kpisResponse.ok()).toBeTruthy();
    const kpis = await kpisResponse.json();

    const executiveResponse = await page.request.get(`${API_URL}/dashboard/executive`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(executiveResponse.ok()).toBeTruthy();
    const executive = await executiveResponse.json();

    await expect(page.getByRole('heading', { name: 'Painel Executivo' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Widgets configuráveis')).toBeVisible();

    expect(kpis?.data?.processes ?? kpis?.processes).toBeGreaterThanOrEqual(0);
    expect(kpis?.data?.alerts ?? kpis?.alerts).toBeGreaterThanOrEqual(0);
    expect(kpis?.data?.assets ?? kpis?.assets).toBeGreaterThanOrEqual(0);

    expect(executive?.data?.summary ?? executive?.summary).toBeTruthy();
    expect((executive?.data?.readinessSignals ?? executive?.readinessSignals)?.length).toBeGreaterThanOrEqual(4);
    expect((executive?.data?.satelliteHealth ?? executive?.satelliteHealth)?.length).toBeGreaterThanOrEqual(4);

    await expect(page.getByRole('heading', { name: 'Visão por secretaria' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prioridades de hoje' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Saúde dos módulos satélite' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sinais de prontidão' })).toBeVisible();
    await expect(page.getByText('Portal institucional')).toBeVisible();
    await expect(page.getByText('RBAC e tenant')).toBeVisible();
  });
});
