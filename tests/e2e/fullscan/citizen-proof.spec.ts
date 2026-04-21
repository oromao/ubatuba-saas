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
  return { accessToken, tenantId };
}

test.describe('T3-CITIZEN: citizen portal flow', () => {
  test('opens a public request and closes it in the 156 workspace', async ({ page }) => {
    const session = await ensureSession(page);
    const protocolSuffix = Date.now().toString().slice(-6);

    await page.goto('/cidadao', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Portal Cidadão 156/i })).toBeVisible({ timeout: 10_000 });

    const publicResponse = await page.request.post(`${API_URL}/public/calls`, {
      data: {
        tenantId: session.tenantId,
        title: `Buraco na via ${protocolSuffix}`,
        category: 'Buracos e Pavimentação',
        description: 'Teste E2E de portal cidadão.',
        reporterName: 'Morador Teste',
        reporterContact: '(12) 99999-0000',
        address: 'Rua Teste, 123',
      },
    });
    expect(publicResponse.ok()).toBeTruthy();
    const publicPayload = await publicResponse.json();
    const protocolText = publicPayload?.data?.protocolNumber ?? publicPayload?.protocolNumber;
    expect(protocolText).toMatch(/^156-/);

    const listResponse = await page.request.get(`${API_URL}/citizen-156/calls`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(listResponse.ok()).toBeTruthy();
    const listPayload = await listResponse.json();
    const calls = listPayload?.data ?? listPayload;
    const created = Array.isArray(calls) ? calls.find((item: any) => item.protocolNumber === protocolText) : null;
    expect(created).toBeTruthy();

    const updateResponse = await page.request.patch(`${API_URL}/citizen-156/calls/${created._id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      data: { status: 'RESOLVIDO', message: 'Chamado resolvido no atendimento' },
    });
    expect(updateResponse.ok()).toBeTruthy();

    await page.goto('/app/156', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Atendimento 156' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(protocolText!)).toBeVisible({ timeout: 10_000 });
    const requestRow = page.getByRole('row').filter({ hasText: protocolText! });
    await expect(requestRow.getByText('RESOLVIDO', { exact: true })).toBeVisible({ timeout: 10_000 });
  });
});
