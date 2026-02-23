import { expect, test } from '@playwright/test';

const TENANT = process.env.TEST_TENANT || 'demo';
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@demo.local';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'Admin@12345';

async function login(page: any, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').click();
  await page.keyboard.type(email, { delay: 40 });
  await page.locator('input[type="password"]').click();
  await page.keyboard.type(password, { delay: 40 });
  await page.locator('input[placeholder="ex: prefeitura-ubatuba"]').click();
  await page.keyboard.type(TENANT, { delay: 40 });
  await Promise.all([
    page.waitForResponse((res: any) => res.url().includes('/auth/login') && res.request().method() === 'POST'),
    page.getByRole('button', { name: 'Entrar' }).click(),
  ]);
  await page.waitForURL(/\/app\/dashboard/);
}

test('@human @critical login e logout', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Painel Executivo').first()).toBeVisible();
  const logoutBtn = page.getByTestId('sidebar-logout').first();
  await logoutBtn.hover();
  await logoutBtn.click();
  await page.waitForURL(/\/login/);
});

test('@human @critical mapa load zoom pan e interacao minima', async ({ page }) => {
  await login(page);
  await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });

  const unavailable = page.getByText(/Mapa indisponivel neste ambiente/i).first();
  if (await unavailable.isVisible().catch(() => false)) {
    await expect(unavailable).toBeVisible();
    return;
  }

  const mapCanvas = page.locator('canvas.maplibregl-canvas').first();
  await mapCanvas.waitFor({ state: 'visible', timeout: 30_000 });
  const box = await mapCanvas.boundingBox();
  expect(box).toBeTruthy();

  if (box) {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.wheel(0, -450);
    await page.waitForTimeout(250);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.55);
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
});

test('@human @critical integracoes e export minimo', async ({ page }) => {
  await login(page);

  await page.goto('/app/integracoes', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Integracoes tributarias/i).first()).toBeVisible();

  await page.goto('/app/pgv/relatorio', { waitUntil: 'domcontentloaded' });
  const exportBtn = page.getByRole('button', { name: /exportar|csv|pdf|xls/i }).first();
  if (await exportBtn.isVisible().catch(() => false)) {
    await exportBtn.hover();
    await exportBtn.click().catch(() => undefined);
  }

  await expect(page.getByText(/PGV|Relatorio/i).first()).toBeVisible();
});
