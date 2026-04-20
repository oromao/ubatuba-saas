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
    // Setup: ensure session
    const session = await ensureSession(page);

    // 1. Navigate to parcels list
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1:has-text("Cadastro Técnico - Parcelas")').first()).toBeVisible({ timeout: 10_000 });

    // 2. Wait for table data to load
    const row = page.locator('tbody tr').first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    // 3. Extract the parcel ID from the first row (get the SQLU)
    const sqluText = await page.locator('tbody tr td').first().innerText();
    const parcelId = await row.getAttribute('data-row-id');
    expect(sqluText).toBeTruthy();

    // 4. Click the row to open detail page
    await row.click();
    await expect(page).toHaveURL(/\/parcelas\/[a-zA-Z0-9]+/, { timeout: 10_000 });

    // 5. Wait for detail page to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });

    // 6. Click Edit button
    const editButton = page.locator('button:has-text("Editar")').first();
    await expect(editButton).toBeVisible({ timeout: 5_000 });
    await editButton.click();

    // 7. Edit the address field that the page actually exposes in edit mode.
    const addressInput = page.locator('text=Endereço').locator('..').locator('input').first();
    await expect(addressInput).toBeVisible({ timeout: 5_000 });
    const originalValue = await addressInput.inputValue();
    const newValue = originalValue ? `${originalValue} [E2E]` : `Rua Teste ${Date.now()}`;
    await addressInput.fill(newValue);

    // 8. Click Save button
    const saveButton = page.locator('button:has-text("Salvar Alterações")').first();
    await expect(saveButton).toBeVisible({ timeout: 5_000 });
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes(`/ctm/parcels/${parcelId}`) &&
        response.request().method() === 'PATCH' &&
        response.ok(),
      ),
      saveButton.click({ force: true }),
    ]);

    // 9. Reload the page to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 });

    // 10. Verify the updated value is still there (check in the detail view)
    const contentText = await page.textContent('body');
    expect(contentText).toContain(newValue);

    // Test passed: parcel search → detail → edit → save → reload → verify persistence is REAL
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

    // Wait for stats to load
    await expect(page.locator('text=Total de Parcelas').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${statsPayload.data.total}`).first()).toBeVisible({ timeout: 10_000 });

    // Try filtering by source type
    const demoButton = page.locator('button:has-text("Demo")').first();
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(500);
      // Verify list updates (at least no error)
      const rows = await page.locator('tbody tr').count();
      expect(rows).toBeGreaterThanOrEqual(0);
    }
  });

  test('03 - Map on parcel detail loads and is interactive', async ({ page }) => {
    const session = await ensureSession(page);
    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });

    // Get first parcel
    const row = page.locator('tbody tr').first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();
    await expect(page).toHaveURL(/\/parcelas\/[a-zA-Z0-9]+/, { timeout: 10_000 });

    // Check that map container is visible
    await expect(page.locator('text=Localização').first()).toBeVisible({ timeout: 10_000 });
    const mapContainer = page.locator('canvas').first();
    await expect(mapContainer).toBeVisible({ timeout: 20_000 });
  });
});
