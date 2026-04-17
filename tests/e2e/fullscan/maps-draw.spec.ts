import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

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
  if (!response.ok) throw new Error(`Falha login admin: ${response.status}`);
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
};

test.describe('maps draw', () => {
  test('ativa o modo de desenho no mapa', async ({ page }) => {
    await ensureSession(page);
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });

    const unavailable = page.getByText(/Mapa indisponivel neste ambiente/i).first();
    if (await unavailable.isVisible().catch(() => false)) {
      await expect(unavailable).toBeVisible();
      return;
    }

    const drawButton = page.getByRole('button', { name: /Desenhar área de demarcação/i }).first();
    await expect(drawButton).toBeVisible({ timeout: 30_000 });
    await drawButton.click();

    await expect(drawButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/Modo desenho ativo: polygon/i).first()).toBeVisible();
  });
});
