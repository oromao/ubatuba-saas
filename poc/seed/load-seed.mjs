#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ACCESS_TOKEN = process.env.POC_ACCESS_TOKEN;
const TENANT_ID = process.env.POC_TENANT_ID;

if (!ACCESS_TOKEN || !TENANT_ID) {
  console.error('Defina POC_ACCESS_TOKEN e POC_TENANT_ID para carregar o seed.');
  process.exit(1);
}

const seedPath = path.resolve(process.cwd(), 'poc/seed/poc-seed.json');
const seed = JSON.parse(await fs.readFile(seedPath, 'utf-8'));

const request = async (endpoint, init = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'X-Tenant-Id': TENANT_ID,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = payload?.detail || payload?.message || `HTTP ${response.status}`;
    throw new Error(`${endpoint}: ${message}`);
  }
  return payload?.data ?? payload;
};

const baseLng = -50.553;
const baseLat = -20.278;

const buildSquare = (idx) => {
  const x = baseLng + (idx % 5) * 0.0012;
  const y = baseLat + Math.floor(idx / 5) * 0.0012;
  return {
    type: 'Polygon',
    coordinates: [[[x, y], [x + 0.001, y], [x + 0.001, y + 0.001], [x, y + 0.001], [x, y]]],
  };
};

const ensureProject = async () => {
  const list = await request('/projects');
  const existing = Array.isArray(list) ? list.find((item) => item.slug === seed.project.slug) : null;
  if (existing?.id) return existing.id;

  const created = await request('/projects', {
    method: 'POST',
    body: JSON.stringify(seed.project),
  });

  return created.id;
};

const projectId = process.env.POC_PROJECT_ID || (await ensureProject());

for (let i = 0; i < seed.parcels.length; i += 1) {
  const parcel = seed.parcels[i];
  try {
    await request('/ctm/parcels', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        sqlu: parcel.sqlu,
        inscription: parcel.inscription,
        status: parcel.status,
        workflowStatus: parcel.workflowStatus,
        mainAddress: `Rua Demo ${i + 1}, Jales/SP`,
        geometry: buildSquare(i),
      }),
    });
  } catch (error) {
    console.warn(`parcel skipped: ${parcel.sqlu} (${error.message})`);
  }
}

for (let i = 0; i < seed.zones.length; i += 1) {
  const zone = seed.zones[i];
  try {
    await request('/pgv/zones', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        code: zone.code,
        name: zone.name,
        baseLandValue: 400 + i * 80,
        baseConstructionValue: 900 + i * 120,
        geometry: buildSquare(i + 10),
      }),
    });
  } catch (error) {
    console.warn(`zone skipped: ${zone.code} (${error.message})`);
  }
}

for (const survey of seed.surveys) {
  try {
    await request('/surveys', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        name: survey.name,
        type: survey.type,
        municipality: survey.municipality,
        surveyDate: new Date().toISOString().slice(0, 10),
        gsdCm: survey.gsdCm,
        srcDatum: 'SIRGAS2000 / EPSG:4326',
        precision: 'PoC',
        supplier: 'FlyDea',
      }),
    });
  } catch (error) {
    console.warn(`survey skipped: ${survey.name} (${error.message})`);
  }
}

try {
  await request('/notifications-letters/templates', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      name: seed.letterTemplate.name,
      html: seed.letterTemplate.html,
    }),
  });
} catch (error) {
  console.warn(`template skipped: ${error.message}`);
}

try {
  await request('/tax-integration/connectors', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      ...seed.taxConnector,
      config: {
        csvSample: 'inscricao,contribuinte,endereco,valor_venal,divida_ativa\nINS-0001,Contribuinte Demo,Rua Demo 1,120000,0',
      },
    }),
  });
} catch (error) {
  console.warn(`connector skipped: ${error.message}`);
}

console.log(`Seed PoC carregado. projectId=${projectId}`);
