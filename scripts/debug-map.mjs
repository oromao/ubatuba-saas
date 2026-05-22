import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'https://labspaulo.site';

async function run() {
  console.log('--- DEBUG MAP START ---');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
      '--enable-webgl'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Escutar logs do console
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // Escutar erros na página
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.message}`);
  });

  // Escutar requisições e respostas de rede
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/ctm/parcels/geojson') || url.includes('/geojson') || url.includes('/parcels')) {
      console.log(`[NETWORK RESPONSE] ${response.status()} ${url}`);
      try {
        const text = await response.text();
        console.log(`[NETWORK RESPONSE BODY (first 200 chars)] ${text.substring(0, 200)}...`);
      } catch (e) {
        console.log(`[NETWORK RESPONSE BODY ERROR] ${e.message}`);
      }
    }
  });

  console.log('Navegando para o Login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@sp.gov.br');
  await page.fill('input[type="password"]', 'admin123');
  await page.fill('input[name="tenantSlug"]', 'saopaulo');
  
  console.log('Clicando em entrar...');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app/dashboard', { timeout: 25000 });
  console.log('Redirecionado para o Dashboard com sucesso!');
  await page.waitForTimeout(4000);

  console.log('Navegando para o Mapa WebGIS...');
  await page.goto(`${BASE_URL}/app/maps`, { waitUntil: 'networkidle' });
  
  console.log('Aguardando 10 segundos para ver a atividade de rede...');
  await page.waitForTimeout(10000);

  // Inspecionar o probe
  const probe = await page.evaluate(() => window.__gisScaleProbe);
  console.log('Valor do __gisScaleProbe:', JSON.stringify(probe, null, 2));

  // Tirar print de depuração
  const debugPrintPath = path.resolve(process.cwd(), 'docs/screenshots/govtech/debug_webgis_direct.png');
  await page.screenshot({ path: debugPrintPath });
  console.log(`Print de depuração salvo em: ${debugPrintPath}`);

  await browser.close();
  console.log('--- DEBUG MAP END ---');
}

run().catch(console.error);
