import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

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
  if (!response.ok) throw new Error(`Falha login admin: ${response.status}`);
  const { accessToken, refreshToken, tenantId } = payload.data;

  await page.context().addInitScript(
    (tokens: { accessToken: string; refreshToken: string; tenantId: string }) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
  );
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
  return { accessToken, refreshToken, tenantId };
}

async function seedUnreadLetters(accessToken: string, tenantId: string) {
  const templateResponse = await fetch(`${API_URL}/notifications-letters/templates`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({
      name: `E2E badge ${Date.now()}`,
      html: 'Aviso para {{sqlu}} em {{endereco}}',
    }),
  });
  if (!templateResponse.ok) {
    throw new Error(`Falha ao criar template: ${templateResponse.status}`);
  }
  const templatePayload = await templateResponse.json();
  const template = templatePayload.data ?? templatePayload;
  const templateId = template._id ?? template.id;

  const batchResponse = await fetch(`${API_URL}/notifications-letters/batches/generate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({
      templateId,
      parcelStatus: 'ATIVO',
    }),
  });
  if (!batchResponse.ok) {
    throw new Error(`Falha ao gerar lote: ${batchResponse.status}`);
  }

  const unreadResponse = await fetch(`${API_URL}/notifications-letters/unread-count`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Tenant-Id': tenantId,
    },
  });
  if (!unreadResponse.ok) {
    throw new Error(`Falha ao ler contador: ${unreadResponse.status}`);
  }
  const unreadPayload = await unreadResponse.json();
  return unreadPayload.data?.count ?? unreadPayload.count ?? 0;
}

test.describe('topbar notifications badge', () => {
  test('shows a real pending-count badge and opens cartas', async ({ page }) => {
    const session = await ensureSession(page);
    const count = await seedUnreadLetters(session.accessToken, session.tenantId);
    const expectedBadge = String(count > 9 ? '9+' : count);

    const button = page.locator('header button').filter({ has: page.locator('span.absolute', { hasText: expectedBadge }) }).first();
    await expect(button).toBeVisible({ timeout: 10_000 });
    await expect(button.locator('span.absolute')).toHaveText(expectedBadge);

    await button.click();
    await expect(page).toHaveURL(/\/app\/cartas/);
  });
});
