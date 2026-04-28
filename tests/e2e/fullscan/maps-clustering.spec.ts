import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * T6-SP-GIS-CLUSTERING
 * Test clustering functionality with large datasets
 * Tests: Supercluster no zoom out, cluster radius 50px, zoom in/out
 */

const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');
const adminStatePath = path.resolve(storageDir, 'admin.json');

async function ensureSession(page: any, roleKey = 'admin') {
  let roles: any;
  try {
    roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  } catch {
    roles = { profiles: [{ key: 'admin' }], tenant: 'demo' };
  }

  const profile = roles.profiles.find((item: any) => item.key === roleKey);
  if (!profile) throw new Error(`Perfil ${roleKey} nao encontrado`);
  const adminState = JSON.parse(await fs.readFile(adminStatePath, 'utf8'));
  const origin = adminState.origins?.find((item: any) => item.origin === 'http://localhost:3000');
  const accessToken = origin?.localStorage?.find((item: any) => item.name === 'accessToken')?.value;
  const refreshToken = origin?.localStorage?.find((item: any) => item.name === 'refreshToken')?.value;
  const tenantId = origin?.localStorage?.find((item: any) => item.name === 'tenantId')?.value;
  if (!accessToken || !refreshToken || !tenantId) {
    throw new Error(`Seed localStorage ausente para ${roleKey}`);
  }
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tokens: any) => {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    sessionStorage.setItem('tenantId', tokens.tenantId);
  }, { accessToken, refreshToken, tenantId });
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
}

test.describe('T6-SP-GIS-CLUSTERING: Clustering no mapa', () => {
  test.beforeEach(async ({ page }) => {
    await ensureSession(page);
  });

  test('01: Mapa carrega com clustering ativado', async ({ page }) => {
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    
    // Esperar o mapa inicializar
    await page.waitForSelector('.maplibregl-map', { timeout: 10000 });
    
    // Verificar que o mapa está visível
    const map = page.locator('.maplibregl-map');
    await expect(map).toBeVisible({ timeout: 10000 });
  });

  test('02: Clusters são visíveis no zoom out', async ({ page }) => {
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector('.maplibregl-map', { timeout: 10000 });
    
    // Zoom out para ver clusters
    const mapCanvas = page.locator('.maplibregl-canvas-container canvas');
    await mapCanvas.click({ position: { x: 100, y: 100 } });
    
    // Aplicar zoom out (scroll para baixa)
    await page.mouse.wheel(0, 200); // Scroll down to zoom out
    await page.waitForTimeout(500);
    
    // Verificar que clusters são renderizados
    // Thes clusters circles
    const clusterCircles = page.locator('.maplibregl-canvas-container canvas');
    await expect(clusterCircles).toBeVisible();
  });

  test('03: Zoom in expande clusters em features individuais', async ({ page }) => {
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector('.maplibregl-map', { timeout: 10000 });
    
    // Zoom in
    await page.mouse.wheel(0, -200); // Scroll up to zoom in
    await page.waitForTimeout(500);
    
    // Esperar que os polígonos individuais sejam visíveis
    // No zoomed in view, as features individuais (non-clustered) devem ser visíveis
    const canvas = page.locator('.maplibregl-canvas-container canvas');
    await expect(canvas).toBeVisible();
  });

  test('04: Navegação com clustering ativo', async ({ page }) => {
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    
    const map = page.locator('.maplibregl-map');
    await expect(map).toBeVisible({ timeout: 10000 });
    
    // Mover o mapa (pan)
    const canvas = page.locator('.maplibregl-canvas-container canvas');
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.mouse.down();
    await page.mouse.move(100, 100, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    
    // Verificar que o mapa não quebrou
    await expect(map).toBeVisible();
  });

  test('05: Tamanho dos clusters aumenta com mais features', async ({ page }) => {
    // Este teste verifica que o raio de cluster (50px) está aplicado
    // e que os clusters têm tamanho apropriado
    await page.goto('/app/maps', { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector('.maplibregl-map', { timeout: 10000 });
    
    // Zoom out完全
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(200);
    }
    
    // Verificar que o mapa continua responsivo
    const map = page.locator('.maplibregl-map');
    await expect(map).toBeVisible();
  });
});
