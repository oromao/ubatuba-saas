#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ACCESS_TOKEN = process.env.POC_ACCESS_TOKEN || '';
const TENANT_ID = process.env.POC_TENANT_ID || '';

const publicEndpoints = [
  '/health',
  '/metrics',
  '/poc/health',
  '/poc/score',
];

const privateEndpoints = [
  '/compliance',
  '/tax-integration/connectors',
  '/notifications-letters/templates',
  '/surveys',
  '/mobile/ctm-sync',
];

const checks = [];
for (const endpoint of publicEndpoints) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    checks.push({
      endpoint,
      ok: response.ok,
      status: response.status,
    });
  } catch (error) {
    checks.push({
      endpoint,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

if (ACCESS_TOKEN && TENANT_ID) {
  for (const endpoint of privateEndpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'X-Tenant-Id': TENANT_ID,
        },
      });
      checks.push({
        endpoint,
        ok: response.ok,
        status: response.status,
      });
    } catch (error) {
      checks.push({
        endpoint,
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

const passed = checks.filter((item) => item.ok).length;
const score = checks.length === 0 ? 0 : Math.round((passed / checks.length) * 100);

const result = {
  apiUrl: API_URL,
  privateChecksEnabled: Boolean(ACCESS_TOKEN && TENANT_ID),
  generatedAt: new Date().toISOString(),
  score,
  checks,
};

const outputPath = path.resolve(process.cwd(), 'poc/checks/last-result.json');
await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

console.log(JSON.stringify(result, null, 2));
if (score < 95) {
  process.exitCode = 1;
}
