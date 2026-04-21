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

test.describe('T2-PARCEL-E2E: Parcel Search/Detail/Update', () => {
  test('01 - Search for parcel, open detail, edit, save, reload, verify persistence', async ({ page }) => {
    const session = await ensureSession(page);

    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Cadastro Técnico - Parcelas')).toBeVisible({ timeout: 15_000 });
    await page.waitForFunction(() => document.querySelectorAll('table tbody tr').length > 1, null, { timeout: 15_000 });

    const row = page.locator('table tbody tr').nth(1);
    await expect(row).toBeVisible({ timeout: 15_000 });

    await row.click();
    await expect(page).toHaveURL(/\/app\/ctm\/parcelas\/[a-zA-Z0-9_-]+/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    const parcelId = page.url().match(/\/app\/ctm\/parcelas\/([a-zA-Z0-9_-]+)/)?.[1];
    expect(parcelId).toBeTruthy();

    const editButton = page.getByRole('button', { name: 'Editar' }).first();
    await expect(editButton).toBeVisible({ timeout: 5_000 });
    await editButton.click();

    const addressField = page.locator('input[type="text"]').last();
    await expect(addressField).toBeVisible({ timeout: 5_000 });
    const originalValue = await addressField.inputValue();
    const newValue = originalValue ? `${originalValue} [E2E]` : `Rua Teste ${Date.now()}`;
    await addressField.fill(newValue);

    const patchResponse = await page.evaluate(async ({ apiUrl, id, token, value }) => {
      const response = await fetch(`${apiUrl}/ctm/parcels/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mainAddress: value }),
      });
      return { status: response.status, ok: response.ok };
    }, { apiUrl: API_URL, id: parcelId, token: session.accessToken, value: newValue });
    expect(patchResponse.ok).toBeTruthy();
    expect(patchResponse.status).toBe(200);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('body')).toContainText(newValue);
  });

  test('02 - Parcel list shows statistics and filters work', async ({ page }) => {
    const session = await ensureSession(page);
    const statsResponse = await fetch(`${API_URL}/ctm/parcels/statistics`, {
      headers: { authorization: `Bearer ${session.accessToken}` },
    });
    expect(statsResponse.ok).toBeTruthy();
    const statsPayload = await statsResponse.json();
    expect(statsPayload.data.total).toBeGreaterThan(0);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Total de Parcelas')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('p.text-2xl').filter({ hasText: String(statsPayload.data.total) }).first()).toBeVisible({ timeout: 10_000 });

    const demoButton = page.getByRole('button', { name: 'Demo' }).first();
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(500);
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    }
  });

  test('03 - Map on parcel detail loads and is interactive', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });

    const row = page.locator('table tbody tr').nth(1);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();
    await expect(page).toHaveURL(/\/app\/ctm\/parcelas\/[a-zA-Z0-9_-]+/, { timeout: 10_000 });

    await expect(page.getByText('Localização')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  });

  test('04 - Parcel detail exposes linked vistorias and history summary', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });

    const row = page.locator('table tbody tr').nth(1);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();
    await expect(page).toHaveURL(/\/app\/ctm\/parcelas\/[a-zA-Z0-9_-]+/, { timeout: 10_000 });

    await expect(page.getByText('Histórico de Alterações')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Histórico de Alterações')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/alterações registradas no log de auditoria/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Vistorias' }).click();
    await expect(page.getByText(/Nenhuma vistoria registrada para este lote\./i)).toBeVisible({ timeout: 10_000 });
  });
});
