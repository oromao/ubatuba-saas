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

test.describe('T3-IMPORT-PROOF: parcel import', () => {
  test('imports a real GeoJSON batch and rejects invalid data without changing totals', async ({ page }) => {
    const session = await ensureSession(page);

    const beforeResponse = await page.request.get(`${API_URL}/ctm/parcels/statistics`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(beforeResponse.ok()).toBeTruthy();
    const before = await beforeResponse.json();
    const beforeTotal = before?.data?.total ?? before?.total;

    const uniqueSqlu = `E2E-IMP-${Date.now()}`;
    const validGeojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: uniqueSqlu,
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-46.6545, -23.5875],
              [-46.6540, -23.5875],
              [-46.6540, -23.5870],
              [-46.6545, -23.5870],
              [-46.6545, -23.5875],
            ]],
          },
          properties: {
            sqlu: uniqueSqlu,
            inscricaoImobiliaria: `${uniqueSqlu}-INS`,
            endereco: 'Rua de Teste',
            bairro: 'Centro',
            areaTerreno: 120,
            status: 'ATIVO',
          },
        },
      ],
    };

    const importResponse = await page.request.post(`${API_URL}/ctm/parcels/import`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      data: {
        sourceType: 'OFFICIAL_IMPORT',
        fileName: 'e2e-import.geojson',
        upsert: false,
        data: validGeojson,
      },
    });
    expect(importResponse.ok()).toBeTruthy();
    const importPayload = await importResponse.json();
    expect(importPayload?.data?.inserted ?? importPayload?.inserted).toBeGreaterThanOrEqual(1);

    const afterImportResponse = await page.request.get(`${API_URL}/ctm/parcels/statistics`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(afterImportResponse.ok()).toBeTruthy();
    const afterImport = await afterImportResponse.json();
    const afterImportTotal = afterImport?.data?.total ?? afterImport?.total;
    expect(afterImportTotal).toBe(beforeTotal + 1);

    const invalidResponse = await page.request.post(`${API_URL}/ctm/parcels/import`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      data: {
        sourceType: 'OFFICIAL_IMPORT',
        fileName: 'e2e-import-invalid.geojson',
        upsert: false,
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-46.6545, -23.5875],
                  [-46.6540, -23.5875],
                  [-46.6540, -23.5870],
                  [-46.6545, -23.5870],
                  [-46.6545, -23.5875],
                ]],
              },
              properties: {
                endereco: 'Sem SQLU',
              },
            },
          ],
        },
      },
    });
    expect(invalidResponse.ok()).toBeTruthy();
    const invalidPayload = await invalidResponse.json();
    expect(invalidPayload?.data?.errors ?? invalidPayload?.errors).toBeGreaterThanOrEqual(1);

    const finalResponse = await page.request.get(`${API_URL}/ctm/parcels/statistics`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(finalResponse.ok()).toBeTruthy();
    const finalStats = await finalResponse.json();
    const finalTotal = finalStats?.data?.total ?? finalStats?.total;
    expect(finalTotal).toBe(afterImportTotal);
  });
});
