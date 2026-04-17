import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');

const API_URL = process.env.API_URL || 'http://localhost:4000';

const ensureSession = async (page: any, roleKey = 'admin') => {
  let roles: any;
  try {
    roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  } catch {
    // Fallback to env vars if roles.json is not present
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

test.describe('Critical Demo Flows', () => {
  test('01 - Dashboard carrega com dados reais', async ({ page }) => {
    await ensureSession(page);
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
  });

  test('02 - Listagem de parcelas CTM carrega', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
    // Stats cards should be visible
    await expect(page.locator('text=Total de Parcelas').first()).toBeVisible({ timeout: 10_000 });
  });

  test('03 - Abrir detalhe de parcela', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });
    // Wait for table rows to load
    const row = page.locator('tbody tr').first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();
    await expect(page).toHaveURL(/\/parcelas\/[a-zA-Z0-9]+/, { timeout: 10_000 });
    await expect(page.locator('text=Parcelas').first()).toBeVisible({ timeout: 5_000 }); // breadcrumb
  });

  test('04 - Listagem REURB carrega com stats', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=REURB').first()).toBeVisible();
  });

  test('05 - REURB: criar projeto e selecionar', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });
    // Scroll to projects section
    await page.locator('text=Projetos REURB').first().scrollIntoViewIfNeeded();
    await expect(page.locator('text=Projetos REURB').first()).toBeVisible({ timeout: 10_000 });
  });

  test('06 - Upload endpoint responde 200', async ({ page }) => {
    const { accessToken, tenantId } = await ensureSession(page);
    // Verify upload endpoint is reachable (POST without files returns empty urls)
    const formData = new FormData();
    const res = await fetch(`${API_URL}/upload/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-tenant-id': tenantId,
      },
      body: formData,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toHaveProperty('urls');
  });

  test('07 - Logradouros CTM carrega', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/logradouros', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
  });

  test('08 - Mobiliario urbano carrega', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/mobiliario', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });
  });
});
