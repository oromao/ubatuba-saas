import fs from 'node:fs/promises';
import { test, expect } from '@playwright/test';

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
}

test.describe('T3-EMPTY-STATES: empty and error states', () => {
  test('renders an explicit error state when a table-backed module cannot fetch data', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/assets**', (route) => route.abort());
    await page.goto('/app/assets', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Ativos territoriais' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar ativos|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders an explicit error state on logradouros too', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/logradouros**', (route) => route.abort());
    await page.goto('/app/ctm/logradouros', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'CTM - Logradouros' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar logradouros|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders an explicit error state on PGV zones as well', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/pgv/zones**', (route) => route.abort());
    await page.goto('/app/pgv/zonas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PGV - Zonas de Valor' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar zonas|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders the empty state for PGV faces when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/pgv/faces**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/pgv/faces', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PGV - Faces de Quadra' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhuma face de quadra configurada.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });

  test('renders the shared empty state for CTM mobiliario urbano too', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/urban-furniture**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ctm/mobiliario', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'CTM - Mobiliario Urbano' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum registro encontrado.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });
});
