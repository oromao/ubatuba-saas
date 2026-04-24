import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

const ensureSession = async (page: any, roleKey = 'admin') => {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
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
  return { accessToken, refreshToken, tenantId };
};

test.describe('T4-MOBILE: Mobile field offline-first flow', () => {
  test('01 - Mobile page loads with offline-first controls', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/mobile', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'FlyDea Mobile Campo' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Coleta CTM offline-first com fila local (IndexedDB) e sincronização automática.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-search-input')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-search-button')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-save-offline')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('mobile-sync-now')).toBeVisible({ timeout: 10_000 });
  });

  test('02 - Offline capture is queued and then synchronized', async ({ page }) => {
    const session = await ensureSession(page);
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: -23.55052, longitude: -46.63331 });
    await page.goto('/mobile', { waitUntil: 'domcontentloaded' });

    const parcelsResponse = await fetch(`${API_URL}/ctm/parcels`, {
      headers: { authorization: `Bearer ${session.accessToken}` },
    });
    const parcels = await parcelsResponse.json();
    const firstParcel = parcels?.data?.[0];
    expect(firstParcel).toBeTruthy();

    const searchValue =
      firstParcel.sqlu ??
      firstParcel.inscriçãoImobiliaria ??
      firstParcel.inscription ??
      firstParcel.mainAddress ??
      firstParcel.id ??
      firstParcel._id;
    expect(searchValue).toBeTruthy();

    await page.getByTestId('mobile-search-input').fill(String(searchValue));
    await page.getByTestId('mobile-search-button').click();

    const parcelTestId = `mobile-parcel-${firstParcel.id ?? firstParcel._id}`;
    const parcelItem = page.getByTestId(parcelTestId);
    await expect(parcelItem).toBeVisible({ timeout: 15_000 });
    await parcelItem.click();

    await page.getByTestId('mobile-check-occupancy').check();
    await page.getByTestId('mobile-check-address').check();
    await page.getByTestId('mobile-capture-gps').click();
    await expect(page.getByText('GPS: -23.550520, -46.633310')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('mobile-photo-input').setInputFiles({
      name: 'evidencia-mobile.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mobile-field-proof'),
    });
    await expect(page.getByText('Foto anexada para envio.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Evidências locais')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('mobile-notes').fill('Coleta de campo offline para prova mobile.');
    await page.context().setOffline(true);
    await page.getByTestId('mobile-save-offline').click();

    await expect(page.getByText('Registro salvo offline.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Fila offline')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('1 registro(s) aguardando sincronização.')).toBeVisible({ timeout: 10_000 });
    await expect(parcelItem).toBeVisible({ timeout: 10_000 });

    await page.context().setOffline(false);
    const syncButton = page.getByTestId('mobile-sync-now');
    await expect(syncButton).toBeVisible({ timeout: 10_000 });
    await syncButton.evaluate((element) => {
      const button = element as HTMLButtonElement;
      button.disabled = false;
      button.click();
    });

    await expect(page.getByText('Fila vazia.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('0 registro(s) aguardando sincronização.')).toBeVisible({ timeout: 20_000 });
  });
});
